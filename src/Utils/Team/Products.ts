import { Brackets, getRepository } from 'typeorm';
import { isValid, parseISO } from 'date-fns';

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
    search?: string;
}

async function getProductsFromTeam(
    props: getProductsFromTeamProps,
): Promise<Product[]> {
    const {
        team_id,
        user_id,
        page,
        removeCheckedBatches,
        sortByBatches,
        search,
    } = props;

    const productTeamsRepository = getRepository(ProductTeams);

    const userStores = await getAllStoresFromUser({ user_id });

    let products: Product[] = [];
    let productsTeam: ProductTeams[] = [];

    const query = productTeamsRepository
        .createQueryBuilder('product_teams')
        .where('product_teams.team_id = :team_id', { team_id })
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

    if (sortByBatches) {
        query.orderBy('batches.exp_date', 'ASC');
    }

    if (search !== undefined && search.trim() !== '') {
        const parsedDate = parseISO(search);
        const isValidDate = isValid(parsedDate);

        if (isValidDate) {
            query.andWhere('DATE(batches.exp_date) = :date', {
                date: parsedDate,
            });
        } else {
            const searchParam = `%${search}%`;

            query.andWhere(
                new Brackets(qb => {
                    qb.where('lower(product.name) like lower(:search)', {
                        search: searchParam,
                    })
                        .orWhere('lower(product.code) like lower(:search)', {
                            search: searchParam,
                        })
                        .orWhere('lower(batches.name) like lower(:search)', {
                            search: searchParam,
                        });
                }),
            );
        }
    }

    if (removeCheckedBatches) {
        query.andWhere('batches.status = :status', { status: 'unchecked' });
    }

    if (page !== undefined) {
        query.take(20).skip(page * 20);
    }

    productsTeam = await query.getMany();

    products = productsTeam.map(p => p.product);

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
