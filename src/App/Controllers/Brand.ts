import { Request, Response } from 'express';
import * as Yup from 'yup';

import { deleteBrand } from '@utils/Brands/Delete';
import { createBrand, getAllBrands, updateBrand } from '@utils/Brand';
import { getAllProductsFromBrand } from '@utils/Brands/Products';
import { sortBrands } from '@utils/Brands/Sort';
import { getUserByFirebaseId } from '@utils/User/Find';
import { getAllStoresFromUser } from '@utils/Stores/Users';
import { isManager } from '@utils/Team/Roles/Manager';

import AppError from '@errors/AppError';

class BrandController {
    async index(req: Request, res: Response): Promise<Response> {
        const { team_id } = req.params;

        const brands = await getAllBrands({ team_id });

        return res.status(200).json(sortBrands(brands));
    }

    async store(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
        });

        try {
            await schema.validate(req.body);
        } catch (err) {
            if (err instanceof Error)
                throw new AppError({
                    message: err.message,
                });
        }

        const { name } = req.body;
        const { team_id } = req.params;

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

        if (!req.userId) {
            throw new AppError({
                message: 'Provide the user id',
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const { brand_id, team_id } = req.params;

        const productsInBrands = await getAllProductsFromBrand({
            brand_id,
            team_id,
        });

        // REMOVE PRODUCTS FROM STORES THAT USER IS NOT IN
        const user = await getUserByFirebaseId(req.userId);
        const userStores = await getAllStoresFromUser({ user_id: user.id });

        const isAManager = await isManager({
            user_id: user.id,
            team_id: req.params.team_id,
        });

        if (userStores.length > 0 && !isAManager) {
            const products = productsInBrands.filter(
                prod => prod.store?.id === userStores[0].store.id,
            );

            return res.json(products);
        }

        return res.json(productsInBrands);
    }
}

export default new BrandController();
