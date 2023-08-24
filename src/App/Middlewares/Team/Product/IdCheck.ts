import { Request, Response, NextFunction } from 'express';
import * as Yup from 'yup';

import AppError from '@errors/AppError';

async function productIdCheck(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void | Response> {
    const schema = Yup.object().shape({
        product_id: Yup.string().required().uuid(),
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

export default productIdCheck;
