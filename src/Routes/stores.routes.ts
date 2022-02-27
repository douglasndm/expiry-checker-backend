import { Router } from 'express';

import Store from '@controllers/Stores/Store';

const routes = Router({ mergeParams: true });

routes.get('/', Store.index);
routes.post('/', Store.create);

export default routes;
