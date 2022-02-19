import { NextFunction, Request, Response } from 'express';

export default async function check(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> {
    if (
        req.headers.internalid &&
        req.headers.internalid === process.env.INTERNAL_ID
    ) {
        return next();
    }

    return res.status(403).send();
}
