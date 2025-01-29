import { Router } from 'express';

import MoveToController from '@admin/controllers/team/stores/products/moveTo';
import RemoveAllProductsFromStore from '@admin/controllers/team/stores/products/removeAll';

const routes = Router({ mergeParams: true });

routes.put('/products/move', MoveToController.store);

routes.delete('/products', RemoveAllProductsFromStore.remove);

export default routes;
