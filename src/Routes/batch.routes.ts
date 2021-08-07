import { Router } from 'express';

import Batch from '@controllers/Batch';
import BatchDiscount from '@controllers/BatchDiscount';
import BatchNotification from '@controllers/Notifications/Batch';

const routes = Router();

routes.get('/:batch_id', Batch.index);
routes.post('', Batch.store);
routes.put('/:batch_id', Batch.update);
routes.delete('/:batch_id', Batch.delete);

routes.post('/discount', BatchDiscount.store);

routes.post('/notifications/:batch_id', BatchNotification.store);

export default routes;
