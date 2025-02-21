import { Router } from 'express';

import User from '@controllers/User';
import ProductInformation from '@controllers/ProductInformation';
import ImageController from '@controllers/Products/ImageController';
import SessionController from '@controllers/User/SessionController';
import Team from '@controllers/Team';
import UserTeams from '@controllers/UserTeams';
import NotificationsPreferences from '@controllers/Notifications/Preferences';

import DeviceChecker from '@middlewares/DeviceChecker';
import FirebaseAuth from '@middlewares/FirebaseAuth';
import LogRequests from '@middlewares/LogRequests';
import HandleSetUserId from '@middlewares/UserIdHandler';

import usersRoutes from './users.routes';
import teamRoutes from './team.routes';
import filesRoutes from './files.routes';

const routes = Router();

routes.use(LogRequests);

routes.post('/users', User.store);

routes.get('/product/:ean', ProductInformation.index);
routes.get('/product/image/:ean', ImageController.index);

routes.use(FirebaseAuth); // from now on all routes need authentication

routes.post('/session', SessionController.store);

routes.use(HandleSetUserId);
routes.use(DeviceChecker);

routes.use('/users', usersRoutes);

routes.get('/user/teams', UserTeams.index);

routes.post('/team', Team.store);
routes.use('/team/:team_id', teamRoutes);

routes.get('/notifications', NotificationsPreferences.index);
routes.put('/notifications', NotificationsPreferences.update);

routes.use(filesRoutes);

export default routes;
