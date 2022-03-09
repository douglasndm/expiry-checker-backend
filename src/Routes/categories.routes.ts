import { Router } from 'express';

import ProductCategory from '@controllers/ProductCategory';

const routes = Router({ mergeParams: true });

routes.get('/:category_id/products', ProductCategory.index);

export default routes;
