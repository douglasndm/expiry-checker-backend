import { Request, Response } from 'express';
import * as Yup from 'yup';

import { createBrand } from '@utils/Brand';

import AppError from '@errors/AppError';

class BrandController {
    async store(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            team_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.body);
        } catch (err) {
            throw new AppError({
                message: err.message,
            });
        }

        const { name, team_id } = req.body;

        const brand = await createBrand({
            name,
            team_id,
        });

        return res.status(201).json(brand);
    }
}

export default new BrandController();
