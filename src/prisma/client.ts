// src/prisma/client.ts
// import { PrismaClient } from '@prisma/client';
import { PrismaClient } from '../../generated/prisma';

let prisma = new PrismaClient();

export default prisma;