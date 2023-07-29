import { Request, Response } from 'express';
import * as Yup from 'yup';

import {
    createBrand,
    deleteBrand,
    getAllBrands,
    updateBrand,
} from '@utils/Brand';
import { getAllProductsFromBrand } from '@utils/Brands/Products';
import { sortBrands } from '@utils/Brands/Sort';
import { getUserByFirebaseId } from '@utils/User/Find';
import { getAllStoresFromUser } from '@utils/Stores/Users';
import { isUserManager } from '@functions/Users/UserRoles';

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

        if (!req.userId) {
            throw new AppError({
                message: 'Provide the user id',
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const { brand_id } = req.params;

        const productsInBrands = await getAllProductsFromBrand({ brand_id });

        // REMOVE PRODUCTS FROM STORES THAT USER IS NOT IN
        const user = await getUserByFirebaseId(req.userId);
        const userStores = await getAllStoresFromUser({ user_id: user.id });

        const isManager = await isUserManager({
            user_id: user.id,
            team_id: req.params.team_id,
            useInternalId: true,
        });

        if (userStores.length > 0 && !isManager) {
            const products = productsInBrands.filter(
                prod => prod.store?.id === userStores[0].store.id,
            );

            return res.json(products);
        }

        return res.json(productsInBrands);
    }
}

export default new BrandController();
