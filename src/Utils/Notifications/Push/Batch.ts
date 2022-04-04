import Firebase from 'firebase-admin';
import * as Sentry from '@sentry/node';

import OneSignalAPI from '@services/OneSignal';

import Batch from '@models/Batch';

import AppError from '@errors/AppError';

interface IOneSignalBatchPushNotification {
    users_id: string[];
    batch: Batch;
    message: string;
}

async function sendNotificationByOneSignal({
    users_id,
    batch,
    message,
}: IOneSignalBatchPushNotification): Promise<void> {
    try {
        await OneSignalAPI.post('/notifications', {
            app_id: process.env.ONESIGNAL_APP_ID,
            channel_for_external_user_ids: 'push',

            include_external_user_ids: users_id,
            contents: { en: message },
            data: {
                deeplinking: `expiryteams://product/${batch.product.id}`,
            },
        });
    } catch (err) {
        if (err instanceof Error)
            throw new AppError({
                message: err.message,
            });
    }
}

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

export {
    sendNotificationByOneSignal,
    sendNotificationByFirebase,
    IOneSignalBatchPushNotification,
};
