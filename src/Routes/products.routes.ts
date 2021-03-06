import { Router } from 'express';

import Product from '@controllers/Product';
import Products from '@controllers/Products';

import ExtraInfo from '@controllers/ExtraInfo';
import FindDuplicate from '@controllers/Product/FindDuplicate';

const routes = Router({ mergeParams: true });

routes.get('/extrainfo', ExtraInfo.index);
routes.post('/duplicate', FindDuplicate.index);

routes.post('/', Product.create);
routes.get('/:product_id', Product.index);
routes.put('/:product_id', Product.update);
routes.delete('/:product_id', Product.delete);

routes.delete('/', Products.delete);

export default routes;
