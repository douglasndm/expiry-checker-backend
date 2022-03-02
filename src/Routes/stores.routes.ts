import { Router } from 'express';

import Store from '@controllers/Stores/Store';
import StoreProducts from '@controllers/Stores/Product';
import StoreUsers from '@controllers/Stores/User';

import ManagerCheck from '@middlewares/ManagerChecker';

const routes = Router({ mergeParams: true });

routes.get('/', Store.index);
routes.post('/', Store.create);

routes.get('/:store_id/products', StoreProducts.index);

routes.get('/:store_id/users', StoreUsers.index);

routes.use(ManagerCheck);
routes.post('/:store_id/users', StoreUsers.store);
routes.delete('/:store_id/users', StoreUsers.delete);

routes.delete('/users', StoreUsers.deleteAll);

export default routes;
