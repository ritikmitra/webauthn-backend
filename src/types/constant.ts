import { JwtPayload } from "jsonwebtoken"


export interface customJwtPayload extends JwtPayload {
    userId: string;
    username: string;
    tokenType?: 'access' | 'refresh';
    iat?: number;
    exp?: number;
} 