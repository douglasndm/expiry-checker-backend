import { Router } from 'express';

import User from './App/Controllers/User';
import Session from './App/Controllers/Session';
import Product from './App/Controllers/Product';
import ProductByUser from './App/Controllers/ProductsByUser';
import Team from './App/Controllers/Team';

import AuthMiddleware from './App/Middlewares/Auth';

const routes = Router();

routes.get('/users/:id', User.index);

routes.post('/users', User.store);

routes.post('/sessions', Session.store);

// from now on all routes need authentication
routes.use(AuthMiddleware);

routes.get('/products/:id', Product.show);
routes.post('/products', Product.create);

routes.get('/products/:user/all', ProductByUser.getAll);

routes.get('/team/:team_id/products', Team.index);

export default routes;
