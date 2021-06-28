import { Router } from 'express';

import User from '@controllers/User';
import Product from '@controllers/Product';
import Category from '@controllers/Category';
import UserManager from '@controllers/UserManager';
import ProductCategory from '@controllers/ProductCategory';
import SessionController from '@controllers/Session';
import Team from '@controllers/Team';

import FirebaseAuth from '@middlewares/FirebaseAuth';
import DeviceChecker from '@middlewares/DeviceChecker';
import ManagerChecker from '@middlewares/ManagerChecker';

import batchRoutes from './batch.routes';
import teamRoutes from './team.routes';
import filesRoutes from './files.routes';

const routes = Router();

routes.post('/users', User.store);

// from now on all routes need authentication
// routes.use(AuthMiddleware);
routes.use(FirebaseAuth);

routes.post('/sessions', SessionController.store);

routes.get('/users/:id', User.index);

routes.use(DeviceChecker);

routes.delete('/users', User.delete);

routes.get('/products/:product_id', Product.index);
routes.post('/products', Product.create);
routes.put('/products/:product_id', Product.update);
routes.delete('/products/:product_id', Product.delete);

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

routes.use(filesRoutes);

// From now one all routes will check if user is a manager

routes.post('/team/:team_id/manager/user', ManagerChecker, UserManager.create);
routes.put('/team/:team_id/manager/user', ManagerChecker, UserManager.update);
routes.delete(
    '/team/:team_id/manager/user/:user_id',
    ManagerChecker,
    UserManager.delete,
);

export default routes;
