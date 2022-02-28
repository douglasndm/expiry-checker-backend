import { Router } from 'express';

import { sendMail } from '@services/Notification/Email/SendMail';
import { dailyPushNotification } from '@utils/Notifications/Schedule/Push';
import { clearAllCache } from '@utils/Admin/Cache';

import User from '@controllers/User';
import Product from '@controllers/Product';
import Products from '@controllers/Products';
import Brand from '@controllers/Brand';
import Category from '@controllers/Category';
import ProductCategory from '@controllers/ProductCategory';
import SessionController from '@controllers/Session';
import Team from '@controllers/Team';
import UserTeams from '@controllers/UserTeams';
import NotificationsPreferences from '@controllers/Notifications/Preferences';

import FirebaseAuth from '@middlewares/FirebaseAuth';
import DeviceChecker from '@middlewares/DeviceChecker';
import InternalCheck from '@middlewares/InternalCheck';

import batchRoutes from './batch.routes';
import teamRoutes from './team.routes';
import filesRoutes from './files.routes';

const routes = Router();

routes.post('/internal/mn', InternalCheck, async (req, res) => {
    await sendMail();

    return res.send('Will be called :)');
});
routes.post('/internal/pn', InternalCheck, (req, res) => {
    dailyPushNotification();

    return res.send('Will be called :)');
});

routes.post('/internal/rc', InternalCheck, async (req, res) => {
    await clearAllCache();

    return res.send('Done');
});

routes.post('/users', User.store);

// from now on all routes need authentication
// routes.use(AuthMiddleware);
routes.use(FirebaseAuth);

routes.post('/sessions', SessionController.store);

routes.use(DeviceChecker);

routes.get('/users', User.index);
routes.put('/users', User.update);
routes.delete('/users', User.delete);

routes.get('/user/teams', UserTeams.index);

routes.get('/products/:product_id', Product.index);
routes.post('/products', Product.create);
routes.put('/products/:product_id', Product.update);
routes.delete('/products/:product_id', Product.delete);

routes.delete('/products', Products.delete);

routes.get('/brands/team/:team_id', Brand.index);
routes.post('/brand', Brand.store);
routes.put('/brand', Brand.update);
routes.delete(`/brand/:brand_id`, Brand.delete);
routes.get('/brand/:brand_id', Brand.allProducts);

routes.use('/batches', batchRoutes);

routes.get('/categories/team/:team_id', Category.index);
routes.post('/categories', Category.create);
routes.put('/categories/:id', Category.update);
routes.delete('/categories/:id', Category.delete);

routes.get('/categories/:category_id/products', ProductCategory.index);
routes.post('/categories/:id', ProductCategory.create);
routes.delete('/categories/product/:id', ProductCategory.delete);

routes.post('/team', Team.store);
routes.use('/team/:team_id', teamRoutes);

routes.get('/notifications', NotificationsPreferences.index);
routes.put('/notifications', NotificationsPreferences.update);

routes.use(filesRoutes);

export default routes;
