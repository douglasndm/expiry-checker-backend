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
    messages: ITokenMessagePush[],
): Promise<void> {
    const messaging = Firebase.messaging();
    const response = await messaging.sendAll(messages);

    if (response.failureCount > 0) {
        captureException(new Error('Failed to send notifications'), response);
    }
}

export { sendNotificationByFirebase };
