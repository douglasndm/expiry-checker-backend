import fs from 'fs';
import { Request, Response } from 'express';
import CryptoJS from 'crypto-js';

import { importProducts } from '@utils/Import/Products';

import AppError from '@errors/AppError';

class ImportController {
    async store(req: Request, res: Response): Promise<Response> {
        if (!process.env.APPLICATION_SECRET_BACKUP_CRYPT) {
            throw new AppError({
                message: 'Server is missing decrypt key',
                statusCode: 500,
            });
        }

        if (!req.file) {
            throw new AppError({
                message: 'File was not sent',
                internalErrorCode: 26,
            });
        }

        const { team_id } = req.params;

        const [_, ext] = req.file.filename.split('.');

        if (ext !== 'cvbf') {
            fs.rmSync(req.file.path);
            throw new AppError({
                message: 'File is not valid',
                statusCode: 400,
                internalErrorCode: 26,
            });
        }

        const fileContent = fs.readFileSync(req.file.path, 'utf8');
        fs.rmSync(req.file.path);

        const decodedFile = CryptoJS.AES.decrypt(
            fileContent,
            process.env.APPLICATION_SECRET_BACKUP_CRYPT,
        );
        const originalFile = decodedFile.toString(CryptoJS.enc.Utf8);
        const parsedFile = JSON.parse(originalFile);

        await importProducts(parsedFile, team_id);

        return res.status(201).json({ message: 'Import completed' });
    }
}

export default new ImportController();
