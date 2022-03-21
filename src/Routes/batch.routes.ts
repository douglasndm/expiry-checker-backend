import { Router } from 'express';

import Batch from '@controllers/Batch';
import BatchDiscount from '@controllers/BatchDiscount';
import BatchNotification from '@controllers/Notifications/Batch';

import BatchChecker from '@middlewares/BatchChecker';

const routes = Router();

routes.post('', Batch.store);
routes.get('/:batch_id', BatchChecker, Batch.index);
routes.put('/:batch_id', BatchChecker, Batch.update);
routes.delete('/:batch_id', BatchChecker, Batch.delete);

routes.post('/discount', BatchDiscount.store);

routes.post('/notifications/:batch_id', BatchNotification.store);

export default routes;
