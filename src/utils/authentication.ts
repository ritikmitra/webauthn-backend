import { type Request } from 'express';
import { type SignOptions, sign, verify } from 'jsonwebtoken';
import { customJwtPayload } from '../types/constant';

function generateToken(payload: object, tokenType: 'access' | 'refresh' = 'access') {
    const secret =
        tokenType === 'access'
            ? process.env.ACCESS_TOKEN_SECRET || 'secret'
            : process.env.REFRESH_TOKEN_SECRET || 'secret';

    const expiresIn =
        tokenType === 'access'
            ? process.env.ACCESS_TOKEN_EXPIRY || '1h'
            : process.env.REFRESH_TOKEN_EXPIRY || '1d';

    const token = sign(
        { ...payload, tokenType },
        secret,
        { expiresIn } as SignOptions
    );

    return token;
}

export default generateToken;

export function isAuthenticated(req: Request): boolean {
    // Check if the request has a valid access token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return false;

    try {
        const secret = process.env.ACCESS_TOKEN_SECRET || 'secret';
        const decoded = verify(token, secret) ;

        // check if the token is of type 'access'
        if (typeof decoded === 'object' && decoded.tokenType !== 'access') {
            return false;
        }
        // if request has a valid token, attach user to request object
        if (typeof decoded === 'object') {
            req.user  = decoded  as customJwtPayload;
        }

        return typeof decoded === 'object';
    } catch (error) {
        return false;
    }
}