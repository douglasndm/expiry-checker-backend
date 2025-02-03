import admin from 'firebase-admin';

import { firebaseAppExpiryChecker } from '@services/Firebase/Config';
import { getNotificationsFromBaseApp } from '@services/Firebase/Firestone';

async function sendNotificationsForBaseApp(): Promise<void> {
	console.log('Sending notifications for base app');
	const messages = await getNotificationsFromBaseApp();

	if (messages.length > 0) {
		console.log(`Sending ${messages.length} notifications for base app`);
		const messaging = admin.messaging(firebaseAppExpiryChecker);

		const batchSize = 500;
		const batches = Math.ceil(messages.length / batchSize);

		for (let i = 0; i < batches; i++) {
			const start = i * batchSize;
			const end = Math.min(start + batchSize, messages.length);
			const batchMessages = messages.slice(start, end);

			console.log(
				`Sending batch ${i + 1} of ${batches} with ${batchMessages.length} notifications`
			);
			await messaging.sendEach(batchMessages);
			await new Promise(resolve => setTimeout(resolve, 5000)); // aguarda 5 segundos
		}
	}
}

export { sendNotificationsForBaseApp };
