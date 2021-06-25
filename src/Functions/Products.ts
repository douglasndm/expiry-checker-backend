import { getRepository } from 'typeorm';
import { compareAsc, startOfDay } from 'date-fns';

import ProductTeams from '@models/ProductTeams';
import { Product } from '@models/Product';

import { sortBatchesByExpDate } from './Batches';

interface checkIfProductAlreadyExistsProps {
    name: string;
    code?: string;
    team_id: string;
}

export async function checkIfProductAlreadyExists({
    name,
    code,
    team_id,
}: checkIfProductAlreadyExistsProps): Promise<boolean> {
    const productTeamRepository = getRepository(ProductTeams);

    const products = await productTeamRepository
        .createQueryBuilder('prods')
        .leftJoinAndSelect('prods.product', 'product')
        .leftJoinAndSelect('prods.team', 'team')
        .where('LOWER(product.name) = LOWER(:product_name)', {
            product_name: name.trim(),
        })
        .andWhere('team.id = :team_id', { team_id })
        .getMany();

    const productExists = products.filter(p => {
        if (code) {
            if (p.product.code !== code) {
                return false;
            }
            return true;
        }

        return true;
    });

    return productExists.length > 0;
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

        const batch1ExpDate = startOfDay(batches1[0].exp_date);
        const batch2ExpDate = startOfDay(batches2[0].exp_date);

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
            return compareAsc(batch1ExpDate, batch2ExpDate);
        }
        if (
            batches1[0].status === 'checked' &&
            batches2[0].status === 'unchecked'
        ) {
            return 1;
        }

        return compareAsc(batch1ExpDate, batch2ExpDate);
    });

    return prodsWithSortedBatchs;
}
