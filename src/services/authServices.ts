import prisma from '../prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  AuthenticatorTransportFuture,
} from '@simplewebauthn/server';
import { Credential } from '../../generated/prisma';

const rpName = process.env.RP_NAME || 'My App';
const rpID = process.env.RP_ID || 'localhost';
const origin = `http://${rpID}`;

const expectedOrigin = origin;

// In-memory store for challenges (you can replace this with Redis or database if needed)
const challenges: Record<string, string> = {};

// ========== Registration (Passkey) ==========
export const generateRegistrationOptionsCustom = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    throw new Error('User already exists');
  }

  const userId = Buffer.from(email, 'utf-8');

  const options = generateRegistrationOptions({
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

  challenges[email] = (await options).challenge;

  // Save user temporarily (only username, real registration after verify)
  await prisma.user.create({
    data: {
      email,
    },
  });

  return { options };
};

export const verifyRegistration = async (email: string, attestationResponse: any) => {
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

  delete challenges[email];
};

// ========== Authentication (Passkey Login) ==========
export const generateAuthenticationOptionsCustom = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { credentials: true },
  });

  if (!user || user.credentials.length === 0) {
    throw new Error('User or credentials not found');
  }

  const options = generateAuthenticationOptions({
    timeout: 60000,
    rpID,
    allowCredentials: user.credentials.map((cred: Credential) => ({
      id: Buffer.from(cred.credentialID).toString('base64'),
      type: 'public-key',
      transports: cred.transports as AuthenticatorTransportFuture[], 
    })),
    userVerification: 'preferred',
  });

  challenges[email] = (await options).challenge;

  return { options };
};

export const verifyAuthentication = async (email: string, assertionResponse: any) => {
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
    throw new Error('User not found');
  }

  // Find the credential that matches the credentialID from the assertionResponse
  const dbAuthenticator = user.credentials.find(
    (credential: Credential) => credential.credentialID === assertionResponse.id
  );

  if (!dbAuthenticator) {
    throw new Error('Authenticator not found or not registered');
  }

  // Perform authentication verification
  const verification = await verifyAuthenticationResponse({
    response: assertionResponse,
    expectedChallenge,
    expectedOrigin,
    expectedRPID: rpID,
    credential: {
      id: Buffer.from(dbAuthenticator.credentialID).toString('base64'),
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

  // Clear the challenge after successful verification
  delete challenges[email];
};


// ========== Simple Email + Password Registration ==========
export const simpleRegister = async (email: string, password: string) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });
};

// ========== Simple Email + Password Login ==========
export const simpleLogin = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password) {
    throw new Error('Invalid Credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid Credentials');
  }

  const token = jwt.sign(
    { userId: user.id, username: user.email },
    process.env.JWT_SECRET || 'secret', // You should use a strong secret in real app
    { expiresIn: '1d' }
  );

  return token;
};
