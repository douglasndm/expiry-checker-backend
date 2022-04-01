import { Router } from 'express';

import Subscription from '@controllers/Subscription';

const routes = Router({ mergeParams: true });

routes.get('/', Subscription.index);
routes.delete('/', Subscription.delete);

routes.get('/store', Subscription.storeData);

export default routes;
