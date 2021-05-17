import { Router } from 'express';

import User from './App/Controllers/User';
import Session from './App/Controllers/Session';
import Product from './App/Controllers/Product';
import Batch from './App/Controllers/Batch';
import Team from './App/Controllers/Team';
import Category from './App/Controllers/Category';
import TeamUsers from './App/Controllers/TeamUsers';
import UserManager from './App/Controllers/UserManager';
import ProductCategory from './App/Controllers/ProductCategory';

import AuthMiddleware from './App/Middlewares/Auth';
import FirebaseAuth from './App/Middlewares/FirebaseAuth';
import ManagerCheckerMiddleware from './App/Middlewares/ManagerChecker';

const routes = Router();

routes.post('/sessions', Session.store);
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

routes.post(
    '/team/:id/manager/user/:user_id',
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
