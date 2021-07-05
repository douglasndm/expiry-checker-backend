import Batch from '@models/Batch';

export function sortBatchesByExpDate(batches: Array<Batch>): Array<Batch> {
    if (batches.length > 1) {
        const sortedBatches = batches.sort((batch1, batch2) => {
            if (batch1.exp_date > batch2.exp_date) return 1;
            if (batch1.exp_date < batch2.exp_date) return -1;
            return 0;
        });

        return sortedBatches;
    }
    return batches;
}
