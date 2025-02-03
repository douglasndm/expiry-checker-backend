import { Router } from 'express';

import SendController from '@admin/controllers/notifications/baseApp/send';
import { sendMail } from '@services/Notification/Email/SendMail';
import { dailyPushNotification } from '@utils/Notifications/Schedule/Push';

const routes = Router({ mergeParams: true });

routes.post('/push/user', SendController.store);

routes.post('/mail/weekly', async (_, res) => {
	sendMail();

	return res.send('Mails Will be send :)');
});

routes.post('/push/daily', async (_, res) => {
	dailyPushNotification();

	return res.send('Push notifications Will be send :)');
});

export default routes;
