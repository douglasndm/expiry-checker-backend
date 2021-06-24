import { Router } from 'express';

import Team from '@controllers/Team';
import TeamUsers from '@controllers/TeamUsers';
import TeamSubscriptions from '@controllers/TeamSubscription';
import Subscription from '@controllers/Subscription';

const routes = Router();

routes.post('/team', Team.store);
routes.put('/team/:team_id', Team.update);
routes.delete('/team/:team_id', Team.delete);
routes.get('/team/:team_id/products', Team.index);
routes.get('/team/:team_id/users', TeamUsers.index);

routes.post('/team/:team_id/join', TeamUsers.store);

routes.get('/team/:team_id/subscriptions', TeamSubscriptions.index);
routes.get('/team/:team_id/subscriptions/check', Subscription.check);

export default routes;
