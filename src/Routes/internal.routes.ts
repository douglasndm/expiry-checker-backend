import { Router } from 'express';
import admin from 'firebase-admin';

import { sendMail } from '@services/Notification/Email/SendMail';

import { dailyPushNotification } from '@utils/Notifications/Schedule/Push';
import { clearAllCache } from '@utils/Admin/Cache';

import InternalCheck from '@middlewares/InternalCheck';

const routes = Router({ mergeParams: true });

routes.use(InternalCheck);

routes.post('/mn', async (req, res) => {
    await sendMail();

    return res.send('Will be called :)');
});
routes.post('/pn', async (req, res) => {
    await dailyPushNotification();

    return res.send('Will be called :)');
});

routes.post('/rc', async (req, res) => {
    await clearAllCache();

    return res.send('Done');
});

routes.get('/token', async (req, res) => {
    if (!process.env.DEBUG_FIREBASE_UID) {
        return res.status(500).send();
    }

    const token = await admin
        .auth()
        .createCustomToken(process.env.DEBUG_FIREBASE_UID);

    return res.json({ token });
});

export default routes;
