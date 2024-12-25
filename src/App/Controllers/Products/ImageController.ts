import { Request, Response } from 'express';
import * as Yup from 'yup';

import { getProductImageURL } from '@services/AWS';

import AppError from '@errors/AppError';

class ImageController {
    async index(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            ean: Yup.string().required(),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
            if (err instanceof Error) {
                throw new AppError({
                    message: err.message,
                });
            }
        }

        const { ean } = req.params;
        const { app } = req.query;

        if (app !== process.env.APP_SECRET) {
            throw new AppError({
                message: 'App is not recognized',
                statusCode: 403,
            });
        }

        const url = await getProductImageURL(ean);

        return res.json({ url });
    }
}

export default new ImageController();
