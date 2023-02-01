import { Router } from 'express';

import LogsController from '@controllers/Team/Management/LogsController';
import CreateUser from '@controllers/Team/Management/Users/Create';

const routes = Router({ mergeParams: true });

routes.get('/logs', LogsController.index);

routes.post('/user/create', CreateUser.store);

export default routes;
