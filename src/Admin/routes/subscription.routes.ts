import { Router } from 'express';

import GetSubscriptionController from '@admin/controllers/team/subscription/get';
import CreateTeamSubscriptionController from '@admin/controllers/team/subscription/create';

const routes = Router({ mergeParams: true });

routes.get('/', GetSubscriptionController.index);
routes.post('/', CreateTeamSubscriptionController.store);

export default routes;
