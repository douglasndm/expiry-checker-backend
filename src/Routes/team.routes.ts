import { Router } from 'express';

import Team from '@controllers/Team';
import TeamUsers from '@controllers/TeamUsers';
import Subscription from '@controllers/Subscription';
import UserManager from '@controllers/UserManager';
import TeamPreferences from '@controllers/TeamPreferences';

import { checkTeamId, checkIfUserIsPending } from '@middlewares/TeamChecker';
import ManagerChecker from '@middlewares/ManagerChecker';

import StoresRoutes from './stores.routes';
import CategoriesRoutes from './categories.routes';

const routes = Router({ mergeParams: true });

routes.use(checkTeamId);

routes.post('/join', TeamUsers.store);

routes.use(checkIfUserIsPending);

routes.put('', Team.update);
routes.get('/products', Team.index);
routes.get('/users', TeamUsers.index);

routes.get('/subscriptions', Subscription.index);

// temp route
routes.get('/subscriptions/recheck', Subscription.recheck);

routes.use('/stores', StoresRoutes);
routes.use('/categories', CategoriesRoutes);

routes.get('/preferences', TeamPreferences.index);

// From now one all routes will check if user is a manager
routes.use(ManagerChecker);
routes.delete('', Team.delete);
routes.post('/manager/user', UserManager.create);
routes.put('/manager/user', UserManager.update);
routes.delete('/manager/user/:user_id', UserManager.delete);

routes.put('/preferences', TeamPreferences.update);

export default routes;
