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

interface Response {
    total: number;
    per_page: number;
    page?: number;
    products: Product[];
}

async function getProductsFromTeam(
    props: getProductsFromTeamProps,
): Promise<Response> {
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
        .leftJoinAndSelect('product.category', 'prodCat')
        .leftJoinAndSelect('prodCat.category', 'category')
        .leftJoinAndSelect('product.batches', 'batches')
        .select([
            'product_teams.id',

            'product.id',
            'product.name',
            'product.code',
            'product.image',
            'product.created_at',
            'product.updated_at',

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
            'batches.created_at',
            'batches.updated_at',
        ]);

    if (sortByBatches) {
        query.orderBy('batches.exp_date', 'ASC');
    }

    if (search !== undefined && search.trim() !== '') {
        const parsedDate = parseISO(search);
        const isValidDate = isValid(parsedDate);

        // WHY THIS? HAHA
        // BACAUSE PARSEISO WAS RETURNING NUMBERS WITHOUT - AS YEAR
        // AND VALID DATE, SO SEARCH NEED TO HAVE - TO BE CONSIDERED A DATE
        if (isValidDate && search.indexOf('-') > -1) {
            query.andWhere('DATE(batches.exp_date) = :date', {
                date: parsedDate,
            });
        } else {
            const searchParam = `%${search}%`;

            query.andWhere(
                new Brackets(qb => {
                    qb.where('product.name ilike :search', {
                        search: searchParam,
                    })
                        .orWhere(
                            'product.code IS NOT NULL AND product.code ilike :search',
                            {
                                search: searchParam,
                            },
                        )
                        .orWhere('batches.name ilike :search', {
                            search: searchParam,
                        });
                }),
            );
        }
    }
    if (removeCheckedBatches) {
        query.andWhere(
            new Brackets(qb => {
                qb.where('batches.status = :status', { status: 'unchecked' });
                qb.orWhere('batches IS NULL');
            }),
        );
    }

    if (page !== undefined) {
        query.take(100).skip(page * 100);
    }

    const [prodsTeams, count] = await query.getManyAndCount();

    productsTeam = prodsTeams;

    products = productsTeam.map(p => p.product);

    // if user is manager they will get full products from any store
    const isManager = await isUserManager({
        user_id,
        team_id,
        useInternalId: true,
    });

    const response = {
        page,
        per_page: 100,
        total: count,
        products,
    };

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

            return {
                ...response,
                products: prods,
            };
        }
    }

    return response;
}

export { getProductsFromTeam };
