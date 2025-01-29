import { Router } from 'express';

import find from '@admin/controllers/user/find';

const routes = Router({ mergeParams: true });

routes.get('/find', find.index);

export default routes;
