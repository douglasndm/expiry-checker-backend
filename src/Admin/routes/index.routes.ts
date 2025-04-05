import { Router } from 'express';

import { invalidadeAllCache } from '@services/Cache/Redis';

import TeamRoutes from './team.routes';
import UserRoutes from './user.routes';
import ProductsRoutes from './products.routes';
import NotificationsRoutes from './notifications.routes';
import StripeRoutes from './stripe.routes';
import MigrateRoutes from './migrate.routes';

const routes = Router();

routes.use('/team', TeamRoutes);
routes.use('/user', UserRoutes);
routes.use('/products', ProductsRoutes);
routes.use('/notifications', NotificationsRoutes);
routes.use('/stripe', StripeRoutes);
routes.use('/migrate', MigrateRoutes);

routes.post('/cache/invalidate', async (req, res) => {
	await invalidadeAllCache();

	return res.send('Cache cleared');
});

export default routes;
