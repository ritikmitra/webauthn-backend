import { type SignOptions, sign } from 'jsonwebtoken';

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