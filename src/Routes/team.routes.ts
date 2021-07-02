import { Router } from 'express';

import Team from '@controllers/Team';
import TeamUsers from '@controllers/TeamUsers';
import TeamSubscriptions from '@controllers/TeamSubscription';
import Subscription from '@controllers/Subscription';
import UserManager from '@controllers/UserManager';

import { checkTeamId, checkIfUserIsPending } from '@middlewares/TeamChecker';
import ManagerChecker from '@middlewares/ManagerChecker';

const routes = Router({ mergeParams: true });

routes.use(checkTeamId);
routes.use(checkIfUserIsPending);

routes.put('', Team.update);
routes.delete('', Team.delete);
routes.get('/products', Team.index);
routes.get('/users', TeamUsers.index);

routes.post('/join', TeamUsers.store);

routes.get('/subscriptions', TeamSubscriptions.index);
routes.get('/subscriptions/check', Subscription.check);

routes.get('/subscriptions/recheck', Subscription.recheck);

// From now one all routes will check if user is a manager
routes.use(ManagerChecker);
routes.post('/manager/user', UserManager.create);
routes.put('/manager/user', UserManager.update);
routes.delete('/manager/user/:user_id', UserManager.delete);

export default routes;
