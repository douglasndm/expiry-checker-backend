import { Router } from 'express';
import multer from 'multer';

import FirestoreImportController from '@admin/controllers/Products/Suggestions/FirestoreImport';

import { storage } from '@config/Multer';

const upload = multer({ storage });

const routes = Router({ mergeParams: true });

routes.post(
	'/suggestions/import',
	upload.single('file'),
	FirestoreImportController.store
);

export default routes;
