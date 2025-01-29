import { Request, Response, NextFunction } from 'express';
import 'express-async-errors';

import './loadEnv';
import './services/database';

import AppError from '@errors/AppError';

import App from './start';

import Routes from './routes/index.routes';

App.use(Routes);

App.use((err: Error, request: Request, response: Response, _: NextFunction) => {
	if (err instanceof AppError) {
		return response.status(err.statusCode).json({
			status: 'error',
			errorCode: err.errorCode,
			message: err.message,
		});
	}

	console.error(err);

	return response.status(500).json({
		status: 'error',
		message: 'Internal server error',
	});
});

export default App;
