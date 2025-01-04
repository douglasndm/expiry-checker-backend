import { Router } from 'express';

import User from '@controllers/User';
import UserTeam from '@controllers/User/UserTeamController';
import UserStore from '@controllers/User/UserStoreController';

const routes = Router({ mergeParams: true });

routes.get('/', User.index);
routes.put('/', User.update);
routes.delete('/', User.delete);

routes.get('/team', UserTeam.index);
routes.get('/store', UserStore.index);

export default routes;
