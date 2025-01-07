import { Brackets } from 'typeorm';
import { isValid, parseISO } from 'date-fns';

import { defaultDataSource } from '@services/TypeORM';

import { getAllStoresFromUser } from '@utils/Stores/Users';
import { isManager } from '@utils/Team/Roles/Manager';

import Product from '@models/Product';

interface getProductsFromTeamProps {
    team_id: string;
    user_id: string;
    page?: number;
    per_page?: number;
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
        page = 0,
        per_page = 100,
        removeCheckedBatches,
        sortByBatches,
        search,
    } = props;

    const productRepository = defaultDataSource.getRepository(Product);

    const userStores = await getAllStoresFromUser({ user_id });

    const products: Product[] = [];

    const query = productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.team', 'team')
        .leftJoinAndSelect('product.store', 'store')
        .leftJoinAndSelect('product.brand', 'brand')
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndSelect('product.batches', 'batches')
        .where('team.id = :team_id', { team_id })
        .select([
            'product.id',
            'product.name',
            'product.code',
            'product.image',
            'product.created_at',
            'product.updated_at',

            'store.id',
            'store.name',
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
        query.orderBy('batches.status', 'DESC');
        query.addOrderBy('batches.exp_date', 'ASC');
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
        // query.take(per_page).skip(page * per_page);
    }

    const [prodsTeams, count] = await query.getManyAndCount();

    // if user is manager they will get full products from any store
    const isAManager = await isManager({
        user_id,
        team_id,
    });

    const response = {
        page,
        per_page: 100,
        total: count,
        products: prodsTeams,
    };

    if (!isAManager) {
        if (userStores.length > 0) {
            const prods = prodsTeams.filter(p => {
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
