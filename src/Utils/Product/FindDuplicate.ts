import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import ProductTeams from '@models/ProductTeams';

import AppError from '@errors/AppError';

interface isProductDuplicateProps {
    name: string;
    code?: string;
    team_id: string;
    store_id?: string;
}

interface isProductDuplicateResponse {
    isDuplicate: boolean;
    product_id?: string;
}

async function isProductDuplicate({
    name,
    code,
    team_id,
    store_id,
}: isProductDuplicateProps): Promise<isProductDuplicateResponse> {
    const schema = Yup.object().shape({
        name: Yup.string().required(),
        code: Yup.string(),
        store_id: Yup.string().uuid(),
    });

    try {
        await schema.validate({ name, code, store_id });
    } catch (err) {
        if (err instanceof Error) {
            throw new AppError({
                message: err.message,
            });
        }
    }

    const productTeamRepository = getRepository(ProductTeams);

    if (code) {
        const products = await productTeamRepository
            .createQueryBuilder('prods')
            .leftJoinAndSelect('prods.product', 'product')
            .leftJoinAndSelect('prods.team', 'team')
            .leftJoinAndSelect('product.store', 'store')
            .where('product.code = :code', {
                code,
            })
            .andWhere('team.id = :team_id', { team_id })
            .getMany();

        if (store_id) {
            const exists = products.find(
                prod => prod.product.store?.id === store_id,
            );

            if (exists) {
                return {
                    isDuplicate: true,
                    product_id: exists.product.id,
                };
            }
            return {
                isDuplicate: false,
            };
        }

        if (products.length > 0) {
            return {
                isDuplicate: true,
                product_id: products[0].product.id,
            };
        }
    }

    const products = await productTeamRepository
        .createQueryBuilder('prods')
        .leftJoinAndSelect('prods.product', 'product')
        .leftJoinAndSelect('prods.team', 'team')
        .leftJoinAndSelect('product.store', 'store')
        .where('LOWER(product.name) = LOWER(:product_name)', {
            product_name: name.trim(),
        })
        .andWhere('team.id = :team_id', { team_id })
        .getMany();

    if (store_id) {
        const exists = products.find(
            prod => prod.product.store?.id === store_id,
        );

        if (exists) {
            return {
                isDuplicate: true,
                product_id: exists.product.id,
            };
        }
        return {
            isDuplicate: false,
        };
    }

    if (products.length > 0) {
        return {
            isDuplicate: true,
            product_id: products[0].product.id,
        };
    }

    return { isDuplicate: false };
}

export { isProductDuplicate };
