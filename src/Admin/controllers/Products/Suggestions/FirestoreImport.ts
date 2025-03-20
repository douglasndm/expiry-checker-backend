import { Request, Response } from 'express';
import fs from 'node:fs';

import { importProducts } from '@admin/utils/Products/Suggestions/FirestoreImport';

import AppError from '@errors/AppError';

class FirestoreImportController {
	async store(req: Request, res: Response): Promise<Response> {
		if (!req.file) {
			throw new AppError({
				message: 'File was not sent',
				internalErrorCode: 26,
			});
		}

		const ext = req.file.filename.split('.').pop();

		if (ext !== 'json') {
			fs.rmSync(req.file.path);

			throw new AppError({
				message: 'File is not valid',
				statusCode: 400,
				internalErrorCode: 26,
			});
		}

		await importProducts(req.file.path);

		fs.rmSync(req.file.path);

		return res.status(201).send();
	}
}

export default new FirestoreImportController();
