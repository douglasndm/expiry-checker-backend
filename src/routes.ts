import { Router } from 'express';

import User from './App/Controllers/User';
import Session from './App/Controllers/Session';
import Product from './App/Controllers/Product';

import AuthMiddleware from './App/Middlewares/Auth';

const routes = Router();

routes.get('/', (req, res) => res.send('ok'));

routes.post('/users', User.store);

routes.post('/sessions', Session.store);

// from now on all routes need authentication
routes.use(AuthMiddleware);

routes.get('/products/:id', Product.show);
routes.post('/products', Product.create);

export default routes;
