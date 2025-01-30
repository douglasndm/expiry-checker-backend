import dotenv from 'dotenv';

import './Services/Firebase/Config';

dotenv.config();

import '@services/Database'; // eslint-disable-line
import Queue from '@services/Background'; // eslint-disable-line

console.log('Starting queue of background jobs...');
Queue.process();
