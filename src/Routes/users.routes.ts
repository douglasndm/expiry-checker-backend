import { Router } from 'express';

import User from '@controllers/User';
import UserTeam from '@controllers/User/UserTeamController';

const routes = Router({ mergeParams: true });

routes.get('/', User.index);
routes.put('/', User.update);
routes.delete('/', User.delete);

routes.get('/team', UserTeam.index);

export default routes;
