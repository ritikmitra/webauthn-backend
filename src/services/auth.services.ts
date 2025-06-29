import prisma from '../prisma/client';
import bcrypt from 'bcrypt';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  AuthenticatorTransportFuture,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/server';
import { Credential } from '../../generated/prisma';
import { isoBase64URL } from "@simplewebauthn/server/helpers"
import generateToken from '../utils/authentication';
import { AppError } from '../errors/AppError';


const rpName = process.env.RP_NAME || 'My App';
const rpID = process.env.RP_ID || 'localhost';
const origin = process.env.RP_ORIGIN || 'http://localhost:5000'; // Replace with your frontend URL


const expectedOrigin = origin;

// In-memory store for challenges (you can replace this with Redis or database if needed)
const challenges: Record<string, string> = {};

export const checkEmailExists = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email }, include: { credentials: true } });
  const isPasskey = user ? user.isPasskey : false;
  return { user: !!user, isPasskey: isPasskey };
}


// ========== Registration (Passkey) ==========
export const generateRegistrationOptionsCustom = async (email: string) => {

  const userId = Buffer.from(email, 'utf-8');

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: userId,
    userName: email,
    timeout: 60000,
    attestationType: 'none',
    authenticatorSelection: {
      userVerification: 'preferred',
      residentKey: 'preferred',
      authenticatorAttachment: 'platform',
    },
  });

  challenges[email] = options.challenge;
  const user = await prisma.user.findUnique({ where: { email } });

  //check if user generated but did not verified
  if (user && !user.isPasskey) {
    throw new AppError('User already exists but not verified', 409, options);
  }


  console.log(`Generating registration options for ${email}`);

  // Save user temporarily (only username, real registration after verify)
  await prisma.user.create({
    data: {
      email,
    },
  });

  return { options };
};

export const verifyRegistration = async (email: string, attestationResponse: RegistrationResponseJSON) => {
  const expectedChallenge = challenges[email];
  if (!expectedChallenge) {
    throw new Error('No challenge found for user');
  }

  const verification = await verifyRegistrationResponse({
    response: attestationResponse,
    expectedChallenge,
    expectedOrigin,
    expectedRPID: rpID,
  });

  if (!verification.verified) {
    throw new Error('Registration verification failed');
  }

  const { credential } = verification.registrationInfo!;

  // Store credential
  await prisma.credential.create({
    data: {
      userId: (await prisma.user.findUnique({ where: { email } }))!.id,
      credentialID: Buffer.from(credential.id, 'base64'),
      credentialPublicKey: credential.publicKey,
      counter: credential.counter,
      transports: credential.transports,
    },
  });

  //enble passkey login for the user

  await prisma.user.update({
    where: { email },
    data: {
      isPasskey: true,
    }
  })

  delete challenges[email];
};

// ========== Authentication (Passkey Login) ==========
export const generateAuthenticationOptionsCustom = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { credentials: true },
  });

  if (!user || user.credentials.length === 0) {
    throw new AppError('User not found', 400);
  }

  const options = await generateAuthenticationOptions({
    timeout: 30000,
    rpID,
    allowCredentials: user.credentials.map((cred: Credential) => ({
      id: isoBase64URL.fromBuffer(cred.credentialID),
      type: 'public-key',
      transports: cred.transports as AuthenticatorTransportFuture[],
    })),
    userVerification: 'preferred',
  });

  challenges[email] = options.challenge;

  return { options };
};

export const verifyAuthentication = async (email: string, assertionResponse: AuthenticationResponseJSON) => {
  const expectedChallenge = challenges[email];
  if (!expectedChallenge) {
    throw new Error('No challenge found for user');
  }

  // Fetch the user and their credentials from the database
  const user = await prisma.user.findUnique({
    where: { email },
    include: { credentials: true },
  });

  if (!user) {
    throw new AppError('User not found', 400);
  }

  // Find the credential that matches the credentialID from the assertionResponse
  const dbAuthenticator = user.credentials.find(
    (credential: Credential) => isoBase64URL.fromBuffer(credential.credentialID) === assertionResponse.id
  );

  if (!dbAuthenticator) {
    throw new AppError('User not found', 400);
  }

  // Perform authentication verification
  const verification = await verifyAuthenticationResponse({
    response: assertionResponse,
    expectedChallenge,
    expectedOrigin,
    expectedRPID: rpID,
    credential: {
      id: isoBase64URL.fromBuffer(dbAuthenticator.credentialID),
      publicKey: dbAuthenticator.credentialPublicKey,
      transports: dbAuthenticator.transports as AuthenticatorTransportFuture[],
      counter: dbAuthenticator.counter,
    }
  });

  if (!verification.verified) {
    throw new Error('Authentication verification failed');
  }

  // Update the counter after successful authentication
  await prisma.credential.update({
    where: { id: dbAuthenticator.id },
    data: { counter: verification.authenticationInfo.newCounter },
  });

  // Generate JWT token
  const accessToken = generateToken({ userId: user.id, username: user.email, role: user.role });
  const refreshToken = generateToken({ userId: user.id, username: user.email }, "refresh");


  // Clear the challenge after successful verification
  delete challenges[email];

  return { accessToken, refreshToken };
};


// ========== Simple Email + Password Registration ==========
export const simpleRegister = async (email: string, password: string, deviceToken?: string, firstName?: string, lastName?: string) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('User already exists', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if (deviceToken) {
    await prisma.user.create({
      data: {
        email,
        displayName: `${firstName} ${lastName}`,
        password: hashedPassword,
        notification: {
          create: {
            deviceToken: deviceToken
          }
        }
      },
      include: {
        notification: true
      }
    });
  } else {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
  }
};

// ========== Simple Email + Password Login ==========
export const simpleLogin = async (email: string, password: string, deviceToken?: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password) {
    throw new AppError('Invalid Credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid Credentials', 401);
  }

  if (deviceToken) {
    // Check if device token already exists
    const existingToken = await prisma.notification.findFirst({
      where: {
        userId: user.id,
        deviceToken: deviceToken
      }
    });

    if (!existingToken) {
      // Create new notification entry with device token
      await prisma.notification.create({
        data: {
          userId: user.id,
          deviceToken: deviceToken
        }
      });
    }
  }


  const accessToken = generateToken({ userId: user.id, username: user.email, role: user.role });

  const refreshToken = generateToken({ userId: user.id, username: user.email }, "refresh");

  return { accessToken, refreshToken };
};
