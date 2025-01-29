import Firebase from 'firebase-admin';

import { captureException } from '@services/ExceptionsHandler';

export interface ITokenMessagePush {
	notification: {
		title: string;
		body: string;
	};
	data: {
		deeplinking: string;
	};
	token: string;
}

async function sendNotificationByFirebase(
	messages: ITokenMessagePush[]
): Promise<void> {
	const messaging = Firebase.messaging();
	const { responses, failureCount } = await messaging.sendEach(messages);

	if (failureCount > 0) {
		captureException(new Error('Failed to send notifications'), {
			responses,
		});
	}
}

export { sendNotificationByFirebase };
