import { compareAsc, parseISO } from 'date-fns';

import Batch from '@models/Batch';

export function sortBatchesByExpDate(batches: Array<Batch>): Array<Batch> {
    if (batches.length > 1) {
        const sortedBatches = batches.sort((batch1, batch2) => {
            let date1 = parseISO(String(batch1.exp_date));
            let date2 = parseISO(String(batch2.exp_date));

            if (
                batch1.exp_date instanceof Date &&
                batch2.exp_date instanceof Date
            ) {
                date1 = batch1.exp_date;
                date2 = batch2.exp_date;
            }

            if (compareAsc(date1, date2) > 0) return 1;
            if (compareAsc(date1, date2) < 0) return -1;
            return 0;
        });

        return sortedBatches;
    }
    return batches;
}
