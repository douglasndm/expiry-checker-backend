import { getRepository } from 'typeorm';

import Batch from '@models/Batch';

async function createManyBatches(batches: Batch[]): Promise<Batch[]> {
    const repository = getRepository(Batch);
    const createdBatches = await repository.save(batches);

    return createdBatches;
}

export { createManyBatches };
