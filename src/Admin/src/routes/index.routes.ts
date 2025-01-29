import { Router } from 'express';

import { invalidadeAllCache } from '@services/Cache/Redis';

import TeamRoutes from './team.routes';
import UserRoutes from './user.routes';
import NotificationsRoutes from './notifications.routes';

const routes = Router();

routes.use('/team', TeamRoutes);
routes.use('/user', UserRoutes);
routes.use('/notifications', NotificationsRoutes);

routes.post('/cache/invalidate', async (req, res) => {
	await invalidadeAllCache();

	return res.send('Cache cleared');
});

export default routes;
