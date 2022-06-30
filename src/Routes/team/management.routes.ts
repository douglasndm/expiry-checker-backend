import { Router } from 'express';

import LogsController from '@controllers/Team/Management/LogsController';

const routes = Router({ mergeParams: true });

routes.get('/logs', LogsController.index);

export default routes;
