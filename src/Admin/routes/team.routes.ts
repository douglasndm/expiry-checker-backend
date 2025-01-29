import { Router } from 'express';

import { checkTeamId } from '@middlewares/TeamChecker';

import RemoveAllProductsFromStore from '@admin/controllers/team/stores/products/removeAll';
import TeamFindController from '@admin/controllers/team/find';
import GetTeamController from '@admin/controllers/team/get';
import GetRolesController from '@admin/controllers/team/users/get';

import StoreRoutes from './store.routes';
import SubscriptionRoutes from './subscription.routes';

const routes = Router({ mergeParams: true });

routes.get('/find/byName', TeamFindController.index);
routes.get('/find/byManager', TeamFindController.byManager);

routes.get('/:team_id', checkTeamId, GetTeamController.index);
routes.get('/:team_id/users', checkTeamId, GetRolesController.index);

routes.delete(
	'/:team_id/store/:store_id/products',
	checkTeamId,
	RemoveAllProductsFromStore.remove
);

routes.use('/:team_id/store/:store_id', checkTeamId, StoreRoutes);

routes.use('/:team_id/subscriptions', checkTeamId, SubscriptionRoutes);

export default routes;
