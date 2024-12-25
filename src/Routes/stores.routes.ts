import { Router } from 'express';

import Store from '@controllers/Stores/Store';
import StoreProducts from '@controllers/Stores/Product';
import StoreUsers from '@controllers/Stores/User';

import ManagerCheck from '@middlewares/ManagerChecker';

const routes = Router({ mergeParams: true });

// This route should be on top because if it is not, it will be caught by the
// delete with store_id route
routes.delete('/users', ManagerCheck, StoreUsers.deleteAll);

routes.get('/', Store.index);
routes.post('/', Store.create);
routes.put('/:store_id', Store.update);
routes.delete('/:store_id', Store.delete);

routes.get('/:store_id/products', StoreProducts.index);

routes.get('/:store_id/users', StoreUsers.index);

routes.use(ManagerCheck);

routes.post('/:store_id/users', StoreUsers.store);
routes.delete('/:store_id/users', StoreUsers.delete);

export default routes;
