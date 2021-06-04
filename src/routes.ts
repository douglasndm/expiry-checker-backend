import { Router } from 'express';

import User from './App/Controllers/User';
import Product from './App/Controllers/Product';
import Batch from './App/Controllers/Batch';
import Team from './App/Controllers/Team';
import Category from './App/Controllers/Category';
import TeamUsers from './App/Controllers/TeamUsers';
import UserManager from './App/Controllers/UserManager';
import ProductCategory from './App/Controllers/ProductCategory';
import TeamSubscriptions from './App/Controllers/TeamSubscription';
import Subscription from './App/Controllers/Subscription';

import FirebaseAuth from './App/Middlewares/FirebaseAuth';
import ManagerCheckerMiddleware from './App/Middlewares/ManagerChecker';

const routes = Router();

routes.post('/users', User.store);

// from now on all routes need authentication
// routes.use(AuthMiddleware);
routes.use(FirebaseAuth);

routes.get('/users/:id', User.index);

routes.get('/products/:id', Product.show);
routes.post('/products', Product.create);
routes.put('/products/:product_id', Product.update);

routes.get('/batches/:id', Batch.index);
routes.post('/batches', Batch.store);
routes.put('/batches/:id', Batch.update);
routes.delete('/batches/:batch_id', Batch.delete);

routes.get('/categories/team/:team_id', Category.index);
routes.post('/categories', Category.create);
routes.put('/categories/:id', Category.update);
routes.delete('/categories/:id', Category.delete);

routes.get('/categories/:id/products', ProductCategory.index);
routes.post('/categories/:id', ProductCategory.create);
routes.delete('/categories/product/:id', ProductCategory.delete);

routes.post('/team', Team.store);
routes.put('/team/:id', Team.update);
routes.get('/team/:team_id/products', Team.index);
routes.get('/team/:id/users', TeamUsers.index);

routes.post('/team/:team_id/join', TeamUsers.store);

routes.get('/team/:team_id/subscriptions', TeamSubscriptions.index);
routes.get('/team/:team_id/subscriptions/check', Subscription.check);

routes.post(
    '/team/:id/manager/user',
    ManagerCheckerMiddleware,
    UserManager.create,
);
routes.put(
    '/team/:id/manager/user/:user_id',
    ManagerCheckerMiddleware,
    UserManager.update,
);
routes.delete(
    '/team/:id/manager/user/:user_id',
    ManagerCheckerMiddleware,
    UserManager.delete,
);

export default routes;
