import schedule from 'node-schedule';

import { sendNotificationsForBaseApp } from '@services/Notification/Push/BaseApp';

import { dailyPushNotification } from '@utils/Notifications/Schedule/Push';
import { allowExternalQuery } from '@utils/ProductSearch/ExternalQuery';
import { callRemainingDailyAPICalls } from '@utils/ProductSearch/ProductRequest';

import { sendMail } from './Notification/Email/SendMail';

// every monday -> friday at 8
// schedule for push notifications
schedule.scheduleJob('0 11 * * 1,2,3,4,5', dailyPushNotification);

// schedule for mail notifications
schedule.scheduleJob(
	process.env.MAIL_NOTIFICATION_PERIOD || '0 9 * * 1',
	sendMail
);

// schedule for reset daily block for request for external ean search
schedule.scheduleJob('0 3 * * *', allowExternalQuery);

// if API is not block it will call remaning call to complete db
schedule.scheduleJob('0 2 * * *', callRemainingDailyAPICalls);

// At minute 0 past hour 9 and 17.
schedule.scheduleJob('0 9,17 * * *', sendNotificationsForBaseApp);
