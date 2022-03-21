import { Router } from 'express';

import AppVersionController from '@controllers/AppVersionController';
import User from '@controllers/User';
import Product from '@controllers/Product';
import Products from '@controllers/Products';
import ProductSearch from '@controllers/ProductSearch';
import Brand from '@controllers/Brand';
import Category from '@controllers/Category';
import ProductCategory from '@controllers/ProductCategory';
import SessionController from '@controllers/Session';
import Team from '@controllers/Team';
import UserTeams from '@controllers/UserTeams';
import NotificationsPreferences from '@controllers/Notifications/Preferences';

import FirebaseAuth from '@middlewares/FirebaseAuth';
import DeviceChecker from '@middlewares/DeviceChecker';

import batchRoutes from './batch.routes';
import teamRoutes from './team.routes';
import filesRoutes from './files.routes';
import internalRoutes from './internal.routes';

const routes = Router();

routes.use('/internal', internalRoutes);

routes.get('/version', AppVersionController.index);

routes.post('/users', User.store);

// temp with out check for auth for expiry checker
routes.get('/products/search', ProductSearch.index);

// from now on all routes need authentication
// routes.use(AuthMiddleware);
routes.use(FirebaseAuth);

routes.post('/sessions', SessionController.store);

routes.use(DeviceChecker);

routes.get('/users', User.index);
routes.put('/users', User.update);
routes.delete('/users', User.delete);

routes.get('/user/teams', UserTeams.index);

routes.get('/products/:product_id', Product.index);
routes.post('/products', Product.create); // REMOVING SOON // REMOVING ON NEXT RELEASE
routes.put('/products/:product_id', Product.update);
routes.delete('/products/:product_id', Product.delete);

routes.delete('/products', Products.delete);

routes.use('/batches', batchRoutes);

routes.get('/categories/team/:team_id', Category.index);
routes.post('/categories', Category.create);
routes.put('/categories/:id', Category.update);
routes.delete('/categories/:id', Category.delete);

// REMOVE SOON, MOVING TO INSIDE TEAM
routes.get('/brand/:brand_id', Brand.allProducts); // REMOVING SOON
routes.get('/brands/team/:team_id', Brand.index);
routes.post('/brand', Brand.store);
routes.put('/brand', Brand.update);
routes.delete(`/brand/:brand_id`, Brand.delete);

routes.get('/categories/:category_id/products', ProductCategory.index); // REMOVING SOON
routes.post('/categories/:id', ProductCategory.create);
routes.delete('/categories/product/:id', ProductCategory.delete);
// END

routes.post('/team', Team.store);
routes.use('/team/:team_id', teamRoutes);

routes.get('/notifications', NotificationsPreferences.index);
routes.put('/notifications', NotificationsPreferences.update);

routes.use(filesRoutes);

export default routes;
