import { Router } from 'express';

import Team from '@controllers/Team';
import TeamUsers from '@controllers/TeamUsers';
import Subscription from '@controllers/Subscription';
import UserManager from '@controllers/UserManager';
import TeamPreferences from '@controllers/TeamPreferences';

import { checkTeamId, checkIfUserIsPending } from '@middlewares/TeamChecker';
import ManagerChecker from '@middlewares/ManagerChecker';

import ProductsRoutes from './products.routes';

import BrandsRoutes from './brands.routes';
import CategoriesRoutes from './categories.routes';
import StoresRoutes from './stores.routes';

const routes = Router({ mergeParams: true });

routes.use(checkTeamId);

routes.post('/join', TeamUsers.store);

routes.use(checkIfUserIsPending);

routes.put('', Team.update);
routes.get('/products', Team.index);
routes.get('/users', TeamUsers.index);

routes.get('/subscriptions', Subscription.index);

routes.use('/products', ProductsRoutes);

routes.use('/brands', BrandsRoutes);
routes.use('/categories', CategoriesRoutes);
routes.use('/stores', StoresRoutes);

routes.get('/preferences', TeamPreferences.index);

// From now one all routes will check if user is a manager
routes.use(ManagerChecker);
routes.delete('', Team.delete);
routes.post('/manager/user', UserManager.create);
routes.put('/manager/user', UserManager.update);
routes.delete('/manager/user/:user_id', UserManager.delete);

routes.put('/preferences', TeamPreferences.update);

export default routes;
