import { Request, Response, NextFunction } from 'express';

async function LogRequest(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    if (process.env.DEV_MODE === 'false') return next();

    console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
    );
    console.log('Params:', req.params);
    console.log('Query:', req.query);
    console.log('Body:', req.body);

    return next();
}

export default LogRequest;
