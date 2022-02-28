import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import { getAllStoresFromUser } from '@utils/Stores/Users';

import { isUserManager } from '@functions/Users/UserRoles';

import ProductTeams from '@models/ProductTeams';
import Product from '@models/Product';

interface getProductsFromTeamProps {
    team_id: string;
    user_id: string;
}

async function getProductsFromTeam({
    team_id,
    user_id,
}: getProductsFromTeamProps): Promise<Product[]> {
    const cache = new Cache();

    const userStores = await getAllStoresFromUser({ user_id });

    const cachedProds = await cache.get<Array<Product>>(
        `products-from-teams:${team_id}`,
    );

    let products: Product[] = [];

    if (!cachedProds) {
        const productTeamsRepository = getRepository(ProductTeams);

        const productsTeam = await productTeamsRepository
            .createQueryBuilder('product_teams')
            .select('product_teams.id')
            .where('product_teams.team_id = :id', { id: team_id })
            .leftJoinAndSelect('product_teams.product', 'product')
            .leftJoinAndSelect('product.store', 'store')
            .leftJoinAndSelect('product.brand', 'brand')
            .leftJoinAndSelect('product.categories', 'prodCat')
            .leftJoinAndSelect('prodCat.category', 'category')
            .leftJoinAndSelect('product.batches', 'batches')
            .orderBy('batches.exp_date', 'ASC')
            .getMany();

        products = productsTeam.map(p => p.product);

        await cache.save(`products-from-teams:${team_id}`, products);
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
                    if (p.store.id === userStores[0].id) {
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
