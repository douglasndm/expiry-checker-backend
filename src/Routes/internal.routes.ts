import { Router } from 'express';

import { sendMail } from '@services/Notification/Email/SendMail';

import { dailyPushNotification } from '@utils/Notifications/Schedule/Push';
import { clearAllCache } from '@utils/Admin/Cache';

import InternalCheck from '@middlewares/InternalCheck';

const routes = Router({ mergeParams: true });

routes.post('/mn', InternalCheck, async (req, res) => {
    await sendMail();

    return res.send('Will be called :)');
});
routes.post('/pn', InternalCheck, (req, res) => {
    dailyPushNotification();

    return res.send('Will be called :)');
});

routes.post('/rc', InternalCheck, async (req, res) => {
    await clearAllCache();

    return res.send('Done');
});

export default routes;
