import * as Yup from 'yup';

import { defaultDataSource } from '@services/TypeORM';

import Product from '@models/Product';

import AppError from '@errors/AppError';

interface isProductDuplicateProps {
    code?: string;
    team_id: string;
    store_id?: string;
}

interface isProductDuplicateResponse {
    isDuplicate: boolean;
    product_id?: string;
}

async function isProductDuplicate({
    code,
    team_id,
    store_id,
}: isProductDuplicateProps): Promise<isProductDuplicateResponse> {
    const schema = Yup.object().shape({
        code: Yup.string(),
        store_id: Yup.string().uuid(),
    });

    try {
        await schema.validate({ code, store_id });
    } catch (err) {
        if (err instanceof Error) {
            throw new AppError({
                message: err.message,
            });
        }
    }

    const productTeamRepository = defaultDataSource.getRepository(Product);

    if (code) {
        const query = productTeamRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.team', 'team')
            .leftJoinAndSelect('product.store', 'store')
            .where('product.code = :code', {
                code,
            })
            .andWhere('team.id = :team_id', { team_id });

        if (store_id) {
            query.andWhere('store.id = :store_id', { store_id });
        } else {
            query.andWhere('product.store IS NULL');
        }

        const products = await query.getMany();

        if (store_id) {
            const exists = products.find(prod => prod.store?.id === store_id);

            if (exists) {
                return {
                    isDuplicate: true,
                    product_id: exists.id,
                };
            }
            return {
                isDuplicate: false,
            };
        }

        if (products.length > 0) {
            return {
                isDuplicate: true,
                product_id: products[0].id,
            };
        }
    }

    return { isDuplicate: false };
}

export { isProductDuplicate };
