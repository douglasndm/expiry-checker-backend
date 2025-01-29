import { Router } from 'express';

import { sendMail } from '@services/Notification/Email/SendMail';
import { dailyPushNotification } from '@utils/Notifications/Schedule/Push';

const routes = Router({ mergeParams: true });

routes.post('/mail/weekly', async (_, res) => {
	sendMail();

	return res.send('Mails Will be send :)');
});

routes.post('/push/daily', async (_, res) => {
	dailyPushNotification();

	return res.send('Push notifications Will be send :)');
});

export default routes;
