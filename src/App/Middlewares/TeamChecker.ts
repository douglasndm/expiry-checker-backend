import { NextFunction, Request, Response } from 'express';
import * as Yup from 'yup';

import AppError from '@errors/AppError';

export async function checkTeamId(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const schema = Yup.object().shape({
        team_id: Yup.string().required().uuid(),
    });

    try {
        await schema.validate(req.params);
    } catch (err) {
        throw new AppError({
            message: err.message,
            statusCode: 400,
            internalErrorCode: 1,
        });
    }

    return next();
}
