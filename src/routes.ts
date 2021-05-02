import { Router } from 'express';

import User from './Controllers/User';
import Session from './Controllers/Session';
import Product from './Controllers/Product';

const routes = Router();

routes.get('/', (req, res) => res.send('ok'));

routes.post('/users', User.store);

routes.post('/sessions', Session.store);

routes.get('/products/:id', Product.show);
routes.post('/products', Product.create);

export default routes;
