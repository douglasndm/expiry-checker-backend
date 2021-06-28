import { Router } from 'express';

import Team from '@controllers/Team';
import TeamUsers from '@controllers/TeamUsers';
import TeamSubscriptions from '@controllers/TeamSubscription';
import Subscription from '@controllers/Subscription';

import { checkTeamId } from '@middlewares/TeamChecker';

const routes = Router({ mergeParams: true });

routes.use(checkTeamId);

routes.put('', Team.update);
routes.delete('', Team.delete);
routes.get('/products', Team.index);
routes.get('/users', TeamUsers.index);

routes.post('/join', TeamUsers.store);

routes.get('/subscriptions', TeamSubscriptions.index);
routes.get('/subscriptions/check', Subscription.check);

routes.get('/subscriptions/recheck', Subscription.recheck);

export default routes;
