import User from '@models/User';
import Team from '@models/Team';

import { createProduct } from '@utils/Product/Create';
import { getProductById } from '@utils/Product/Get';
import { removeBrandFromProduct } from '@utils/Product/Brand/Remove';
import { createBrand } from '@utils/Brand';
import { deleteBrand } from '@utils/Brands/Delete';

import AppError from '@errors/AppError';

import connection from '@tests/Services/Database';
import { setup } from '@tests/setup';

describe('Remove a brand from product', () => {
    let user: User | null = null;
    let team: Team | null = null;

    beforeAll(async () => {
        await connection.create();

        const init = await setup(2);

        user = init.user;
        team = init.team;
    });

    afterAll(async () => {
        await connection.close();
    });

    beforeEach(async () => {
        await connection.clear();
    });

    it('it should remove a brand from a product', async () => {
        if (!team || !user) return;

        const brand = await createBrand({
            team_id: team.id,
            user_id: user.id,
            name: 'Nestle',
        });

        const product = await createProduct({
            name: 'Prod1',
            team_id: team.id,
            user_id: user.id,
            brand_id: brand.id,
        });

        expect(product.brand?.id).toBe(brand.id);
        expect(product.brand?.name).toBe(brand.name);

        await removeBrandFromProduct(product.id);
        const product2 = await getProductById({
            product_id: product.id,
            includeBrand: true,
        });

        expect(product2.brand).toBeNull();
    });

    it('should not remove a brand from a product with invalid product uuid', async () => {
        if (!team || !user) return;

        try {
            await removeBrandFromProduct(
                '60c02b9a-0157-4720-bb31-bac939154e1a',
            );
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);

            if (err instanceof AppError) {
                expect(err.errorCode).toBe(8);
            }
        }
    });

    it('should not remove a brand from a product with invalid product id', async () => {
        if (!team || !user) return;

        try {
            await removeBrandFromProduct('asd asd1da ');
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);

            if (err instanceof AppError) {
                expect(err.errorCode).toBe(1);
            }
        }
    });

    it('should remove a brand from a product when the brand is deleted', async () => {
        if (!team || !user) return;

        const brand = await createBrand({
            team_id: team.id,
            user_id: user.id,
            name: 'Coca Cola',
        });

        const product = await createProduct({
            name: 'Prod1',
            team_id: team.id,
            user_id: user.id,
            brand_id: brand.id,
        });

        expect(product.brand?.id).toBe(brand.id);
        expect(product.brand?.name).toBe(brand.name);

        await deleteBrand({
            brand_id: brand.id,
            user_id: user.id,
        });

        const updatedProduct = await getProductById({
            product_id: product.id,
            includeBrand: true,
        });

        expect(updatedProduct.brand).toBeNull();
    });
});
