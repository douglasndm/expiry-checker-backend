import { Router } from 'express';

import Session from './Controllers/Session';
import Product from './Controllers/Product';

const routes = Router();

routes.get('/', (req, res) => res.send('ok'));

routes.post('/sessions', Session.store);

routes.get('/products/:id', Product.show);
routes.post('/products', Product.create);

export default routes;
