import * as schedule from 'node-schedule';
import * as Sentry from '@sentry/node';

import { sendNotificationsForBaseApp } from '@services/Notification/Push/BaseApp';

import { dailyPushNotification } from '@utils/Notifications/Schedule/Push';
import { allowExternalQuery } from '@utils/ProductSearch/ExternalQuery';

import { sendMail } from './Notification/Email/SendMail';

const scheduleWithCheckIn = Sentry.cron.instrumentNodeSchedule(schedule);

// Cron at GMT timezone, adding -3 hours
// Cron at GMT timezone, adding -3 hours
// Cron at GMT timezone, adding -3 hours

// every monday -> friday at 8
// schedule for push notifications
scheduleWithCheckIn.scheduleJob(
	'daily-push-notifications',
	'0 8 * * 1,2,3,4,5',
	dailyPushNotification
);

// At 07:00 on Monday
// schedule for mail notifications
scheduleWithCheckIn.scheduleJob(
	'weekly-mail-notifications',
	'0 7 * * 1',
	sendMail
);

// At 00:00
// schedule for reset daily block for request for external ean search
scheduleWithCheckIn.scheduleJob(
	'removing-block-for-external-api-request',
	'0 0 * * *',
	allowExternalQuery
);

// At 08:00 and 14:00
scheduleWithCheckIn.scheduleJob(
	'daily-push-notifications-for-base-app',
	'0 8,14 * * *',
	sendNotificationsForBaseApp
);
