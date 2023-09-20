import { compareAsc, parseISO } from 'date-fns';

import Product from '@models/Product';

import { sortBatchesByExpDate } from '@utils/Product/Batch/Sort';

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
