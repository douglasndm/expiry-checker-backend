import { Router } from 'express';

import ProductController from '@controllers/ProductController';

const routes = Router({ mergeParams: true });

routes.post('/', ProductController.create);

export default routes;
