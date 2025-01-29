import 'reflect-metadata';
import express from 'express';

import '@services/Firebase';

const App = express();

App.use(express.json());

export default App;
