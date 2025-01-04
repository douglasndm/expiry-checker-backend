import { Router } from 'express';

import Brand from '@controllers/Brand';

const routes = Router({ mergeParams: true });

routes.get('/', Brand.index);
routes.post('/', Brand.store);
routes.put('/', Brand.update);
routes.put('/:brand_id', Brand.update);
routes.delete(`/:brand_id`, Brand.delete);

routes.get('/:brand_id/products', Brand.allProducts);

export default routes;
