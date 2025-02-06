import dotenv from 'dotenv';
dotenv.config();

import '@services/Sentry';
import '@services/Firebase/Config';
import '@services/Database';
import Queue from '@services/Queue';

console.log('Starting queue of background jobs...');
Queue.process();
