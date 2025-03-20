import { Router } from 'express';
import multer from 'multer';

import FirestoreImportController from '@admin/controllers/Products/Suggestions/FirestoreImport';
import CountController from '@admin/controllers/Products/Suggestions/Count';

import { storage } from '@config/Multer';

const upload = multer({ storage });

const routes = Router({ mergeParams: true });

routes.post(
	'/suggestions/import',
	upload.single('file'),
	FirestoreImportController.store
);

routes.get('/suggestions/count', CountController.index);

export default routes;
