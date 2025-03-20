import { Router } from 'express';

import GetCustomerController from '@admin/controllers/stripe/getCustomerController';
import CreateCustomerController from '@admin/controllers/stripe/createCustomerController';

import CreateSubscriptionController from '@admin/controllers/stripe/createSubscriptionController';
import getAvailableSubscriptions from '@admin/controllers/stripe/getAvailableSubscriptions';
import getSubscription from '@admin/controllers/stripe/getSubscription';

const routes = Router({ mergeParams: true });

routes.get('/customer', GetCustomerController.index);
routes.post('/customer', CreateCustomerController.store);

routes.get('/subscriptions', getAvailableSubscriptions.index);
routes.get('/subscription/:subscription_name', getSubscription.index);
routes.post('/subscription', CreateSubscriptionController.store);

export default routes;
