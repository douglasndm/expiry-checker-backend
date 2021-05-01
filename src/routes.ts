import { Router } from 'express';

import Product from './Controllers/Product';

const routes = Router();

routes.get('/', (req, res) => res.send('ok'));

routes.get('/products/:id', Product.show);

export default routes;
