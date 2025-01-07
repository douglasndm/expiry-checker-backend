import { Router } from 'express';

import AppCheck from '@middlewares/AppChecker';

import App from './app.routes';

const routes = Router();

routes.use('/', App);
routes.use('/v1.1/', AppCheck, App);

export default routes;
