import dotenv from 'dotenv';

import './Services/Firebase';

dotenv.config();

import '@services/Database'; // eslint-disable-line
import Queue from '@services/Background'; // eslint-disable-line

Queue.process();
