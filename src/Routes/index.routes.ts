import { Router } from 'express';

import Auth from '@controllers/Auth';

import AppVersionController from '@controllers/AppVersionController';
import User from '@controllers/User';
import ProductSearch from '@controllers/ProductSearch';
import ProductInformation from '@controllers/ProductInformation';
import ImageController from '@controllers/Products/ImageController';
import SessionController from '@controllers/Session';
import Team from '@controllers/Team';
import UserTeams from '@controllers/UserTeams';
import NotificationsPreferences from '@controllers/Notifications/Preferences';

import AppCheck from '@middlewares/AppChecker';
import FirebaseAuth from '@middlewares/FirebaseAuth';
import DeviceChecker from '@middlewares/DeviceChecker';
import HandleSetUserId from '@middlewares/UserIdHandler';

import batchRoutes from './batch.routes';
import teamRoutes from './team.routes';
import filesRoutes from './files.routes';
import internalRoutes from './internal.routes';

const routes = Router();

routes.use('/internal', internalRoutes);

routes.get('/version', AppVersionController.index);

routes.post('/users', User.store);

routes.post('/auth', Auth.store);

// temp with out check for auth for expiry checker
routes.get('/products/search', ProductSearch.index);
routes.get('/product/:ean', AppCheck, ProductInformation.index);
routes.get('/product/image/:ean', ImageController.index);

// from now on all routes need authentication
routes.use(FirebaseAuth);

routes.post('/sessions', SessionController.store);

routes.use(HandleSetUserId);
routes.use(DeviceChecker);

routes.get('/users', User.index);
routes.put('/users', User.update);
routes.delete('/users', User.delete);

routes.get('/user/teams', UserTeams.index);

routes.use('/batches', batchRoutes);

routes.post('/team', Team.store);
routes.use('/team/:team_id', teamRoutes);

routes.get('/notifications', NotificationsPreferences.index);
routes.put('/notifications', NotificationsPreferences.update);

routes.use(filesRoutes);

export default routes;
