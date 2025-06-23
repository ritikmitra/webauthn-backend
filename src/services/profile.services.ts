import { AppError } from '../errors/AppError';
import prisma from '../prisma/client';




export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select : {
        id: true,
        displayName: true,
        email : true,
        isPasskey: true,
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

export const updateUserProfile = async (userId: string, displayName: string) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { displayName },
    select: {
      id: true,
      displayName: true,
      email: true,
      isPasskey: true,
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};


export const getUserProfileByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      displayName: true,
      email: true,
      isPasskey: true,
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      displayName: true,
      email: true,
    }
  });

  return users;
};

export const getUserDeviceTokens = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select:{
      id : true
    }
  });
  
    if (!user) {
      throw new AppError('User not found', 404);
    }
  
  const deviceTokens = prisma.notification.findMany({
    where : {
      userId : user.id
    },
    select : {
      deviceToken : true
    }
  })
  if (!deviceTokens) {
    throw new AppError('No device tokens found for user', 404);
  }

  return deviceTokens;
}

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      displayName: true,
      email: true,
      isPasskey: true,
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}