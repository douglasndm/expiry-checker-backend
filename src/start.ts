import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';

import './Services/Firebase';
import './Services/Cache/Redis';
import './Services/Database';
import './Services/Cron';
import './Services/AWS';

dotenv.config();

const App = express();

App.use(express.json());

export default App;
