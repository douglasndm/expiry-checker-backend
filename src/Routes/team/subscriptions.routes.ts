import { Router } from 'express';

import Subscription from '@controllers/Subscription';
import Stripe from '@controllers/Team/Subscription/StripeController';

const routes = Router({ mergeParams: true });

routes.get('/', Subscription.index);
routes.delete('/', Subscription.delete);

routes.post('/stripe', Stripe.store);

routes.get('/store', Subscription.storeData);

export default routes;
