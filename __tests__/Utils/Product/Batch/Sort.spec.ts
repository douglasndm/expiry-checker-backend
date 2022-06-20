import { addDays, subDays, endOfDay } from 'date-fns';

import Batch from '@models/Batch';

import { sortBatchesByExpDate } from '@utils/Product/Batch/Sort';

describe('Sort of batches', () => {
    it('should return sorted batches', () => {
        const batch1 = new Batch();
        batch1.exp_date = endOfDay(new Date());

        const batch2 = new Batch();
        batch2.exp_date = addDays(endOfDay(new Date()), 7);

        const batch3 = new Batch();
        batch3.exp_date = subDays(endOfDay(new Date()), 7);

        const sortedBatches = sortBatchesByExpDate([batch2, batch3, batch1]);

        expect(sortedBatches[0]).toBe(batch3);
        expect(sortedBatches[1]).toBe(batch1);
        expect(sortedBatches[2]).toBe(batch2);
    });
});
