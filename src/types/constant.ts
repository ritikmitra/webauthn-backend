import { JwtPayload } from "jsonwebtoken"
import { UserRole } from "../../generated/prisma";

export interface customJwtPayload extends JwtPayload {
    userId: string;
    username: string;
    tokenType: 'access' | 'refresh';
    iat?: number;
    exp?: number;
    role : UserRole;
} 