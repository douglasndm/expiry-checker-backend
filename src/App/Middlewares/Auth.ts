import { Request, Response, NextFunction } from 'express';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';

import AuthConfig from '../../Config/Auth';

async function CheckAuth(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void | Response> {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token was not provide' });
    }

    const [, token] = authHeader.split(' ');

    try {
        const decoded = await promisify(jwt.verify)(token, AuthConfig.secret);

        req.userId = decoded.id;

        return next();
    } catch (err) {
        return res.status(401).json({ error: 'Token is not valid' });
    }
}

export default CheckAuth;
