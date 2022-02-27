import { Router } from 'express';

import Store from '@controllers/Stores/Store';
import StoreProducts from '@controllers/Stores/Product';

const routes = Router({ mergeParams: true });

routes.get('/', Store.index);
routes.post('/', Store.create);

routes.get('/:store_id/products', StoreProducts.index);

export default routes;
