import { Router } from 'express';

import find from '@admin/controllers/user/find';
import mailConfirm from '@admin/controllers/user/mailConfirm';

const routes = Router({ mergeParams: true });

routes.get('/find', find.index);
routes.put('/mail/:email/confirm', mailConfirm.update);

export default routes;
