import * as schedule from 'node-schedule';
import * as Sentry from '@sentry/node';

import { sendNotificationsForBaseApp } from '@services/Notification/Push/BaseApp';

import { dailyPushNotification } from '@utils/Notifications/Schedule/Push';
import { allowExternalQuery } from '@utils/ProductSearch/ExternalQuery';
import { callRemainingDailyAPICalls } from '@utils/ProductSearch/ProductRequest';

import { sendMail } from './Notification/Email/SendMail';

const scheduleWithCheckIn = Sentry.cron.instrumentNodeSchedule(schedule);

// Cron at GMT timezone, adding -3 hours
// Cron at GMT timezone, adding -3 hours
// Cron at GMT timezone, adding -3 hours

// every monday -> friday at 8
// schedule for push notifications
scheduleWithCheckIn.scheduleJob(
	'daily-push-notifications',
	'0 11 * * 1,2,3,4,5',
	dailyPushNotification
);

// At 06:00 on Monday
// schedule for mail notifications
scheduleWithCheckIn.scheduleJob(
	'weekly-mail-notifications',
	'0 9 * * 1',
	sendMail
);

// At 00:00
// schedule for reset daily block for request for external ean search
scheduleWithCheckIn.scheduleJob(
	'removing-block-for-external-api-request',
	'0 3 * * *',
	allowExternalQuery
);

// At 23:00
// if API is not block it will call remaning call to complete db
scheduleWithCheckIn.scheduleJob(
	'call-remaining-daily-api-calls',
	'0 2 * * *',
	callRemainingDailyAPICalls
);

// At 09:00 AM and 05:00 PM
// At minute 0 past hour 9 and 15.
scheduleWithCheckIn.scheduleJob(
	'daily-push-notifications-for-base-app',
	'0 12,18 * * *',
	sendNotificationsForBaseApp
);
