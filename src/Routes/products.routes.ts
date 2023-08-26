import { Router } from 'express';

import ProductIdCheck from '@middlewares/Team/Product/IdCheck';

import Team from '@controllers/Team';
import Product from '@controllers/Product';
import Products from '@controllers/Products';
import ProductsFind from '@controllers/Products/Find';
import ProductsImages from '@controllers/Products/ImagesController';

import ExtraInfo from '@controllers/ExtraInfo';
import FindDuplicate from '@controllers/Product/FindDuplicate';

const routes = Router({ mergeParams: true });

routes.get('/', Team.index);
routes.get('/search', ProductsFind.index);

routes.get('/images', ProductsImages.index);

routes.get('/extrainfo', ExtraInfo.index);
routes.get('/duplicate', FindDuplicate.index);

routes.post('/', Product.create);
routes.get('/:product_id', ProductIdCheck, Product.index);
routes.put('/:product_id', ProductIdCheck, Product.update);
routes.delete('/:product_id', ProductIdCheck, Product.delete);

routes.delete('/', Products.delete);

export default routes;
