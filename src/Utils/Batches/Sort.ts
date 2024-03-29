import { endOfDay } from 'date-fns';

import Batch from '@models/Batch';

export function sortBatches(batches: Array<Batch>): Array<Batch> {
    // Gambiarra para .sort da função funcionar
    // por algum motivo sem isso sort é undefined
    const fixed = batches.map(batch => batch);

    const sorted = fixed.sort((batch1, batch2) => {
        const date1 = endOfDay(batch1.exp_date);
        const date2 = endOfDay(batch2.exp_date);

        if (date1 > date2) {
            return 1;
        }
        if (date1 < date2) {
            return -1;
        }

        return 0;
    });

    return sorted;
}
