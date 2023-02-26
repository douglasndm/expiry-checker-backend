import { Request, Response } from 'express';
import * as Yup from 'yup';

import { getProductImageURL } from '@services/AWS';

import AppError from '@errors/AppError';

class ImagesController {
    async index(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            codes: Yup.array().of(Yup.string()).required(),
        });

        try {
            await schema.validate(req.body);
        } catch (err) {
            if (err instanceof Error) {
                throw new AppError({
                    message: err.message,
                });
            }
        }

        const { codes } = req.body;

        const response = codes.map((code: string) => {
            const url = getProductImageURL(code);

            return {
                code,
                url,
            };
        });

        return res.json(response);
    }
}

export default new ImagesController();
