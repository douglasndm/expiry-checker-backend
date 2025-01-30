import admin from 'firebase-admin';
import { Message } from 'firebase-admin/lib/messaging/messaging-api';

import { firebaseAppExpiryChecker } from '@services/Firebase';

interface IMessage {
	messagingToken: string;
	notificationString: string;
	notificationTitle: string;
}

async function getNotificationsFromBaseApp(): Promise<Message[]> {
	const response = await admin
		.firestore(firebaseAppExpiryChecker)
		.collection('users')
		.get();

	const messages: Message[] = [];

	response.forEach(doc => {
		const data = doc.data() as IMessage;
		messages.push({
			token: data.messagingToken,
			notification: {
				title: data.notificationTitle,
				body: data.notificationString,
			},
		});
	});

	return messages;
}

export { getNotificationsFromBaseApp };
