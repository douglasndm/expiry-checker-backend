import { Router } from 'express';

import MigrateUsersController from '@admin/controllers/migrations/migrateUsers';

const routes = Router({ mergeParams: true });

routes.post('/users', MigrateUsersController.store);

export default routes;
