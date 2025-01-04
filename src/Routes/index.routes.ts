import { Router } from 'express';

import Auth from '@controllers/Auth';

import User from '@controllers/User';
import ProductSearch from '@controllers/ProductSearch';
import ProductInformation from '@controllers/ProductInformation';
import ImageController from '@controllers/Products/ImageController';
import SessionController from '@controllers/Session';
import Team from '@controllers/Team';
import UserTeams from '@controllers/UserTeams';
import NotificationsPreferences from '@controllers/Notifications/Preferences';

import DeleteAll from '@controllers/BaseApp/DeleteAll';

import AppCheck from '@middlewares/AppChecker';
import FirebaseAuth from '@middlewares/FirebaseAuth';
import DeviceChecker from '@middlewares/DeviceChecker';
import HandleSetUserId from '@middlewares/UserIdHandler';

import usersRoutes from './users.routes';
import teamRoutes from './team.routes';
import filesRoutes from './files.routes';

const routes = Router();

// temp with out check for auth for expiry checker
routes.get('/products/search', ProductSearch.index);
// This is be removed very soon, waiting apple aproval

// routes.use(AppCheck);

routes.post('/users', User.store);

routes.post('/auth', Auth.store);

routes.get('/product/:ean', ProductInformation.index);
routes.get('/product/image/:ean', ImageController.index);

// from now on all routes need authentication
routes.use(FirebaseAuth);

routes.delete('/baseApp/allData', AppCheck, DeleteAll.delete);

routes.post('/sessions', SessionController.store);

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
