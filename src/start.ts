import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const App = express();

App.use(express.json());

export default App;
