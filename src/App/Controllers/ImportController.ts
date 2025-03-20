import fs from 'node:fs';
import { Request, Response } from 'express';

import { importProducts } from '@utils/Import/Products';

import AppError from '@errors/AppError';

class ImportController {
	async store(req: Request, res: Response): Promise<Response> {
		if (!req.file) {
			throw new AppError({
				message: 'File was not sent',
				internalErrorCode: 26,
			});
		}

		const { team_id } = req.params;

		const ext = req.file.filename.split('.').pop();

		if (ext !== 'cvbf') {
			fs.rmSync(req.file.path);
			throw new AppError({
				message: 'File is not valid',
				statusCode: 400,
				internalErrorCode: 26,
			});
		}

		const fileContent = fs.readFileSync(req.file.path, 'utf8');
		const parsedFile = JSON.parse(fileContent);

		fs.rmSync(req.file.path);

		await importProducts(parsedFile, team_id);

		return res.status(201).json({ message: 'Import completed' });
	}
}

export default new ImportController();
