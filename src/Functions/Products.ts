import { getRepository } from 'typeorm';
import { compareAsc, parseISO } from 'date-fns';

import ProductTeams from '@models/ProductTeams';
import Product from '@models/Product';

import { sortBatchesByExpDate } from '@utils/Product/Batch/Sort';

interface checkIfProductAlreadyExistsProps {
    name: string;
    code?: string;
    team_id: string;
    store_id?: string;
}

export async function checkIfProductAlreadyExists({
    name,
    code,
    team_id,
    store_id,
}: checkIfProductAlreadyExistsProps): Promise<boolean> {
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

            if (exists) return true;
            return false;
        }

        const productsWithoutStores = products.filter(
            prod => !prod.product.store,
        );

        if (productsWithoutStores.length > 0) {
            return true;
        }

        return false;
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

        if (exists) return true;
        return false;
    }

    const productsWithoutStores = products.filter(prod => !prod.product.store);

    return productsWithoutStores.length > 0;
}

export function sortProductsByBatchesExpDate(
    products: Array<Product>,
): Array<Product> {
    const prodsWithSortedBatchs = products.sort((prod1, prod2) => {
        const batches1 = sortBatchesByExpDate(prod1.batches);
        const batches2 = sortBatchesByExpDate(prod2.batches);

        // if one of the products doesnt have batches it will return
        // the another one as biggest
        if (batches1.length > 0 && batches2.length <= 0) {
            return -1;
        }
        if (batches1.length === 0 && batches2.length === 0) {
            return 0;
        }
        if (batches1.length <= 0 && batches2.length > 0) {
            return 1;
        }

        let date1 = parseISO(String(batches1[0].exp_date));
        let date2 = parseISO(String(batches2[0].exp_date));

        if (
            batches1[0].exp_date instanceof Date &&
            batches2[0].exp_date instanceof Date
        ) {
            date1 = batches1[0].exp_date;
            date2 = batches2[0].exp_date;
        }

        if (
            batches1[0].status === 'unchecked' &&
            batches2[0].status === 'checked'
        ) {
            return -1;
        }
        if (
            batches1[0].status === 'checked' &&
            batches2[0].status === 'checked'
        ) {
            return compareAsc(date1, date2);
        }
        if (
            batches1[0].status === 'checked' &&
            batches2[0].status === 'unchecked'
        ) {
            return 1;
        }

        return compareAsc(date1, date2);
    });

    return prodsWithSortedBatchs;
}
