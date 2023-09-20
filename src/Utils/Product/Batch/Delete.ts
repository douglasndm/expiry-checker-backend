import { getRepository } from 'typeorm';

import Batch from '@models/Batch';

import { clearProductCache } from '@utils/Cache/Product';
import { findBatchById } from './Find';

async function deleteBatch(batch_id: string): Promise<void> {
    const batch = await findBatchById(batch_id);

    await clearProductCache(batch.product.id);

    const repository = getRepository(Batch);
    await repository.remove(batch);
}

export { deleteBatch };
