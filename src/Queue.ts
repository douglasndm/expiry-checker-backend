import dotenv from 'dotenv';
import * as Sentry from '@sentry/node';

import './Services/Firebase';

dotenv.config();

if (process.env.DEV_MODE === 'false') {
    Sentry.init({
        dsn: process.env.SENTRY_DSN_QUEUES,
    });
}
import '@services/Database'; // eslint-disable-line
import Queue from '@services/Background'; // eslint-disable-line

Queue.process();
