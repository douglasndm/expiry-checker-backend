import 'reflect-metadata';
import express from 'express';
import cors from 'cors';

import Routes from './routes';

import './Functions/Auth/Firebase';

const App = express();

App.use(cors());
App.use(express.json());

App.use(Routes);

export default App;
