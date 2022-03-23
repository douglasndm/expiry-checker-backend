import { Router } from 'express';

import ProductController from '@controllers/ProductController';
import ExtraInfo from '@controllers/ExtraInfo';

const routes = Router({ mergeParams: true });

routes.post('/', ProductController.create);

routes.get('/extrainfo', ExtraInfo.index);

export default routes;
