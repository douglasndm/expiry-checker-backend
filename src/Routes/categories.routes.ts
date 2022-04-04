import { Router } from 'express';

import Category from '@controllers/Category';
import ProductCategory from '@controllers/ProductCategory';

import ManagerChecker from '@middlewares/ManagerChecker';

const routes = Router({ mergeParams: true });

routes.get('/', Category.index);

routes.post('/', ManagerChecker, Category.create);
routes.put('/:category_id', ManagerChecker, Category.update);
routes.delete('/:category_id', ManagerChecker, Category.delete);

routes.get('/:category_id/products', ProductCategory.index);

export default routes;
