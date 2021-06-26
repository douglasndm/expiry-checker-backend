import 'reflect-metadata';
import express from 'express';
import * as Sentry from '@sentry/node';
import cors from 'cors';
import dotenv from 'dotenv';

import rateLimiter from './App/Middlewares/RateLimiter';
import Routes from './Routes/index.routes';

import './Functions/Auth/Firebase';

dotenv.config();

const App = express();

Sentry.init({ dsn: process.env.SENTRY_DSN });
App.use(Sentry.Handlers.requestHandler());

App.use(rateLimiter);

App.use(cors());
App.use(express.json());

App.use(Routes);

export default App;
