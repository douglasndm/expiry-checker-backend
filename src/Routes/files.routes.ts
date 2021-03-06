import { Router } from 'express';
import multer from 'multer';

import { storage } from '../Config/Multer';

import ManagerCheckerMiddleware from '../App/Middlewares/ManagerChecker';

import Import from '../App/Controllers/ImportController';

const filesRoute = Router();

const upload = multer({ storage });

filesRoute.post(
    '/team/:team_id/products/import',
    ManagerCheckerMiddleware,
    upload.single('file'),
    Import.store,
);

export default filesRoute;
