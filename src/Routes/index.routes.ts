import { Router } from 'express';

import User from '@controllers/User';
import Product from '@controllers/Product';
import Brand from '@controllers/Brand';
import Category from '@controllers/Category';
import ProductCategory from '@controllers/ProductCategory';
import SessionController from '@controllers/Session';
import Team from '@controllers/Team';
import UserTeams from '@controllers/UserTeams';

import FirebaseAuth from '@middlewares/FirebaseAuth';
import DeviceChecker from '@middlewares/DeviceChecker';

import NotificationsPreferences from '@controllers/Notifications/Preferences';

import batchRoutes from './batch.routes';
import teamRoutes from './team.routes';
import filesRoutes from './files.routes';

const routes = Router();

routes.post('/users', User.store);

// from now on all routes need authentication
// routes.use(AuthMiddleware);
routes.use(FirebaseAuth);

routes.post('/sessions', SessionController.store);

routes.use(DeviceChecker);

// end temp route
routes.get('/users', User.index);

routes.delete('/users', User.delete);

routes.get('/user/teams', UserTeams.index);

routes.get('/products/:product_id', Product.index);
routes.post('/products', Product.create);
routes.put('/products/:product_id', Product.update);
routes.delete('/products/:product_id', Product.delete);

routes.post('/brand', Brand.store);

routes.use('/batches', batchRoutes);

routes.get('/categories/team/:team_id', Category.index);
routes.post('/categories', Category.create);
routes.put('/categories/:id', Category.update);
routes.delete('/categories/:id', Category.delete);

routes.get('/categories/:category_id/products', ProductCategory.index);
routes.post('/categories/:id', ProductCategory.create);
routes.delete('/categories/product/:id', ProductCategory.delete);

routes.post('/team', Team.store);
routes.use('/team/:team_id', teamRoutes);

routes.get('/notifications', NotificationsPreferences.index);
routes.put('/notifications', NotificationsPreferences.update);

routes.use(filesRoutes);

export default routes;
