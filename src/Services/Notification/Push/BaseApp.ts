import admin from 'firebase-admin';

import { firebaseAppExpiryChecker } from '@services/Firebase/Config';
import { getNotificationsFromBaseApp } from '@services/Firebase/Firestone';

async function sendNotificationsForBaseApp(): Promise<void> {
	console.log('Sending notifications for base app');
	const messages = await getNotificationsFromBaseApp();

	if (messages.length > 0) {
		console.log(`Sending ${messages.length} notifications for base app`);
		const messaging = admin.messaging(firebaseAppExpiryChecker);

		await messaging.sendEach(messages);
	}
}

export { sendNotificationsForBaseApp };
