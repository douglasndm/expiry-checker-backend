import admin from 'firebase-admin';
import * as Sentry from '@sentry/node';

import { firebaseAppExpiryChecker } from '@services/Firebase/Config';
import { getNotificationsFromBaseApp } from '@services/Firebase/Firestone';

import { logDateTime } from '@utils/Logs/LogDateTime';

async function sendNotificationsForBaseApp(): Promise<void> {
	const checkInId = Sentry.captureCheckIn({
		monitorSlug: 'daily-push-notifications-for-base-app',
		status: 'in_progress',
	});

	logDateTime();
	console.log('Sending notifications for base app');
	const messages = await getNotificationsFromBaseApp();

	if (messages.length > 0) {
		logDateTime();
		console.log(`Sending ${messages.length} notifications for base app`);
		const messaging = admin.messaging(firebaseAppExpiryChecker);

		const batchSize = 500;
		const batches = Math.ceil(messages.length / batchSize);

		for (let i = 0; i < batches; i++) {
			const start = i * batchSize;
			const end = Math.min(start + batchSize, messages.length);
			const batchMessages = messages.slice(start, end);

			logDateTime();
			console.log(
				`Sending batch ${i + 1} of ${batches} with ${batchMessages.length} notifications`
			);
			await messaging.sendEach(batchMessages);
			await new Promise(resolve => setTimeout(resolve, 5000)); // aguarda 5 segundos
		}
	}

	Sentry.captureCheckIn({
		checkInId,
		monitorSlug: 'daily-push-notifications-for-base-app',
		status: 'ok',
	});
}

export { sendNotificationsForBaseApp };
