import express from 'express';
import 'reflect-metadata';

import Routes from './routes';

const App = express();

App.use(Routes);

export default App;
