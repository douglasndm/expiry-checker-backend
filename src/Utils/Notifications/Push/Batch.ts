import Firebase from 'firebase-admin';
import * as Sentry from '@sentry/node';

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
        Sentry.captureException(response);
    }
}

export { sendNotificationByFirebase };
