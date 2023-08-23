import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import Product from '@models/Product';
import ProductTeams from '@models/ProductTeams';
import Store from '@models/Store';

import { getAllStoresFromTeam } from '@utils/Stores/List';
import { getUserRoleInTeam } from '@utils/UserRoles';
import { getAllBrands } from '@utils/Brand';
import { getUserStoreOnTeam } from '@utils/Stores/Team';

import { checkIfProductAlreadyExists } from '@functions/Products';

import AppError from '@errors/AppError';

import { getTeamById } from '@utils/Team/Find';
import { addToCategory } from './Category/AddToCategory';

interface createProductProps {
    name: string;
    code?: string;
    team_id: string;
    user_id: string;
    brand_id?: string;
    category_id?: string;
    store_id?: string;
}

async function createProduct({
    name,
    code,
    team_id,
    user_id,
    brand_id,
    category_id,
    store_id,
}: createProductProps): Promise<Product> {
    const repository = getRepository(Product);
    const productTeamRepository = getRepository(ProductTeams);

    const team = await getTeamById(team_id);

    const userRoleOnTeam = await getUserRoleInTeam({ user_id, team_id });

    let userStore: Store | undefined;

    if (userRoleOnTeam === 'manager' && store_id) {
        const stores = await getAllStoresFromTeam({ team_id });

        const store = stores.find(sto => sto.id === store_id);

        if (store) {
            userStore = store;
        } else {
            throw new AppError({
                message: 'Store was not found',
                internalErrorCode: 37,
            });
        }
    } else {
        const uStore = await getUserStoreOnTeam({ team_id, user_id });

        if (uStore?.store) {
            userStore = uStore.store;
        }
    }
    /*

    const productAlreadyExists = await checkIfProductAlreadyExists({
        name,
        code,
        team_id,
        store_id: store_id || userStore?.id,
    });

    if (productAlreadyExists) {
        throw new AppError({
            message: 'This product already exists. Try add a new batch',
            statusCode: 400,
            internalErrorCode: 11,
        });
    } */

    const allBrands = await getAllBrands({ team_id });
    const findedBrand = allBrands.find(b => b.id === brand_id);

    const prod: Product = new Product();
    prod.name = name;
    prod.code = code || null;

    const cache = new Cache();

    if (findedBrand) {
        prod.brand = findedBrand;
        await cache.invalidade(`products-from-brand:${findedBrand.id}`);
    }

    if (userStore) {
        prod.store = userStore;

        await cache.invalidade(`products-from-store:${userStore.id}`);
    }

    const savedProd = await repository.save(prod);

    const productTeam = new ProductTeams();
    productTeam.product = savedProd;
    productTeam.team = team;

    await productTeamRepository.save(productTeam);

    if (category_id !== undefined) {
        await addToCategory({
            product_id: prod.id,
            category_id,
        });

        await cache.invalidade(`products-from-category:${category_id}`);
    }

    await cache.invalidade(`products-from-teams:${team_id}`);

    return savedProd;
}

export { createProduct };
