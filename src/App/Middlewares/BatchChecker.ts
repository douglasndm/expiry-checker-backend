import { Request, Response, NextFunction } from 'express';
import * as Yup from 'yup';

import AppError from '@errors/AppError';

export default async function deviceChecker(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const schema = Yup.object().shape({
        batch_id: Yup.string().required().uuid(),
    });

    try {
        await schema.validate(req.params);
    } catch (err) {
        if (err instanceof Error)
            throw new AppError({
                message: err.message,
                statusCode: 400,
                internalErrorCode: 1,
            });
    }

    return next();
}
