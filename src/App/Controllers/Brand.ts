import { Request, Response } from 'express';
import * as Yup from 'yup';

import {
    createBrand,
    deleteBrand,
    getAllBrands,
    getAllProductsFromBrand,
    updateBrand,
} from '@utils/Brand';
import { getUserByFirebaseId } from '@utils/User';

import AppError from '@errors/AppError';

class BrandController {
    async index(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            team_id: Yup.string().required().uuid(),
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

        const { team_id } = req.params;

        const brands = await getAllBrands({ team_id });

        return res.status(200).json(brands);
    }

    async store(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            team_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.body);
        } catch (err) {
            if (err instanceof Error)
                throw new AppError({
                    message: err.message,
                });
        }

        const { name, team_id } = req.body;

        const user = await getUserByFirebaseId(req.userId || '');

        const brand = await createBrand({
            name,
            team_id,
            user_id: user.id,
        });

        return res.status(201).json(brand);
    }

    async update(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            brand_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.body);
        } catch (err) {
            if (err instanceof Error)
                throw new AppError({
                    message: err.message,
                });
        }

        const { name, brand_id } = req.body;

        const user = await getUserByFirebaseId(req.userId || '');

        const brand = await updateBrand({
            name,
            brand_id,
            user_id: user.id,
        });

        return res.status(201).json(brand);
    }

    async delete(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            brand_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
            if (err instanceof Error)
                throw new AppError({
                    message: err.message,
                });
        }

        const { brand_id } = req.params;

        const user = await getUserByFirebaseId(req.userId || '');

        await deleteBrand({
            brand_id,
            user_id: user.id,
        });

        return res.status(200).send();
    }

    async allProducts(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            brand_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
            if (err instanceof Error)
                throw new AppError({
                    message: err.message,
                });
        }

        const { brand_id } = req.params;

        const brands = await getAllProductsFromBrand({ brand_id });

        return res.json(brands);
    }
}

export default new BrandController();
