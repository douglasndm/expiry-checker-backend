import { Router } from 'express';

import User from '@controllers/User';
import Product from '@controllers/Product';
import Batch from '@controllers/Batch';
import Team from '@controllers/Team';
import Category from '@controllers/Category';
import TeamUsers from '@controllers/TeamUsers';
import UserManager from '@controllers/UserManager';
import ProductCategory from '@controllers/ProductCategory';
import TeamSubscriptions from '@controllers/TeamSubscription';
import Subscription from '@controllers/Subscription';
import SessionController from '@controllers/Session';

import FirebaseAuth from './App/Middlewares/FirebaseAuth';
import DeviceChecker from './App/Middlewares/DeviceChecker';
import ManagerChecker from './App/Middlewares/ManagerChecker';

import filesRoutes from './Routes/files';

const routes = Router();

routes.post('/users', User.store);
routes.post('/sessions', SessionController.store);

// from now on all routes need authentication
// routes.use(AuthMiddleware);
routes.use(FirebaseAuth);

routes.get('/users/:id', User.index);

routes.use(DeviceChecker);

routes.delete('/users', User.delete);

routes.get('/products/:product_id', Product.index);
routes.post('/products', Product.create);
routes.put('/products/:product_id', Product.update);
routes.delete('/products/:product_id', Product.delete);

routes.get('/batches/:batch_id', Batch.index);
routes.post('/batches', Batch.store);
routes.put('/batches/:batch_id', Batch.update);
routes.delete('/batches/:batch_id', Batch.delete);

routes.get('/categories/team/:team_id', Category.index);
routes.post('/categories', Category.create);
routes.put('/categories/:id', Category.update);
routes.delete('/categories/:id', Category.delete);

routes.get('/categories/:category_id/products', ProductCategory.index);
routes.post('/categories/:id', ProductCategory.create);
routes.delete('/categories/product/:id', ProductCategory.delete);

routes.post('/team', Team.store);
routes.put('/team/:team_id', Team.update);
routes.delete('/team/:team_id', Team.delete);
routes.get('/team/:team_id/products', Team.index);
routes.get('/team/:team_id/users', TeamUsers.index);

routes.post('/team/:team_id/join', TeamUsers.store);

routes.get('/team/:team_id/subscriptions', TeamSubscriptions.index);
routes.get('/team/:team_id/subscriptions/check', Subscription.check);

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
