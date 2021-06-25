import 'reflect-metadata';
import express from 'express';
import cors from 'cors';

import rateLimiter from './App/Middlewares/RateLimiter';

import Routes from './Routes/index.routes';

import './Functions/Auth/Firebase';

const App = express();

App.use(rateLimiter);

App.use(cors());
App.use(express.json());

App.use(Routes);

export default App;
