import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import { getAllStoresFromUser } from '@utils/Stores/Users';

import { isUserManager } from '@functions/Users/UserRoles';

import ProductTeams from '@models/ProductTeams';
import Product from '@models/Product';

interface getProductsFromTeamProps {
    team_id: string;
    user_id: string;
    page?: number;
    removeCheckedBatches?: boolean;
    sortByBatches?: boolean;
}

async function getProductsFromTeam({
    team_id,
    user_id,
    page,
    removeCheckedBatches,
    sortByBatches,
}: getProductsFromTeamProps): Promise<Product[]> {
    const cache = new Cache();

    const userStores = await getAllStoresFromUser({ user_id });

    /* const cachedProds = await cache.get<Array<Product>>(
        `products-from-teams:${team_id}`,
    ); */
    // temp disable of cache
    const cachedProds = null;

    let products: Product[] = [];

    if (!cachedProds) {
        const productTeamsRepository = getRepository(ProductTeams);

        let productsTeam: ProductTeams[] = [];

        const query = productTeamsRepository
            .createQueryBuilder('product_teams')
            .where('product_teams.team_id = :id', { id: team_id })
            .leftJoinAndSelect('product_teams.product', 'product')
            .leftJoinAndSelect('product.store', 'store')
            .leftJoinAndSelect('product.brand', 'brand')
            .leftJoinAndSelect('product.categories', 'prodCat')
            .leftJoinAndSelect('prodCat.category', 'category')
            .leftJoinAndSelect('product.batches', 'batches')
            .select([
                'product_teams.id',
                'product.id',
                'product.name',
                'product.code',
                'store.id',
                'store.name',
                'prodCat.id',
                'category.id',
                'category.name',
                'brand.id',
                'brand.name',

                'batches.id',
                'batches.name',
                'batches.exp_date',
                'batches.amount',
                'batches.price',
                'batches.status',
                'batches.price_tmp',
            ]);

        if (sortByBatches && sortByBatches === true) {
            query.orderBy('batches.exp_date', 'ASC');
        }
        if (removeCheckedBatches && removeCheckedBatches === true) {
            query.andWhere('batches.status = :status', { status: 'unchecked' });
        }

        if (page !== undefined) {
            query.take(20).skip(page * 20);
        }

        productsTeam = await query.getMany();

        products = productsTeam.map(p => p.product);

        // await cache.save(`products-from-teams:${team_id}`, products);
    } else {
        products = cachedProds;
    }

    // if user is manager they will get full products from any store
    const isManager = await isUserManager({
        user_id,
        team_id,
        useInternalId: true,
    });

    if (!isManager) {
        if (userStores.length > 0) {
            const prods = products.filter(p => {
                if (p.store) {
                    if (p.store.id === userStores[0].store.id) {
                        return true;
                    }
                }
                return false;
            });

            return prods;
        }
    }

    return products;
}

export { getProductsFromTeam };
