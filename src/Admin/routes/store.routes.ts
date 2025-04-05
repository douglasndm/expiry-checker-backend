import { Router } from 'express';

import StoreListController from '@admin/controllers/team/stores/ListController';
import MoveToController from '@admin/controllers/team/stores/products/moveTo';
import RemoveAllProductsFromStore from '@admin/controllers/team/stores/products/removeAll';

const routes = Router({ mergeParams: true });

routes.get('/list', StoreListController.index);
routes.put('/products/move', MoveToController.store);

routes.delete('/products', RemoveAllProductsFromStore.remove);

export default routes;
