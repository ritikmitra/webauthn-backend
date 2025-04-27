import jwt from 'jsonwebtoken';

function generateToken(payload: string | Buffer | object) {
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
        expiresIn: '1h'
    })
    return token;
}


export default generateToken;