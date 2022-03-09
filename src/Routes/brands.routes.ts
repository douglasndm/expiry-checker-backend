import { Router } from 'express';

import Brand from '@controllers/Brand';

const routes = Router({ mergeParams: true });

routes.get('/:brand_id/products', Brand.allProducts);

export default routes;
