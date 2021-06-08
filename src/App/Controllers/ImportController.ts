import { Request, Response } from 'express';
import fs from 'fs';
import CryptoJS from 'crypto-js';

class ImportController {
    async store(req: Request, res: Response): Promise<Response> {
        const [_, ext] = req.file.filename.split('.');

        if (ext !== 'cvbf') {
            fs.rmSync(req.file.path);
            return res.status(400).json({ error: 'File is not valid' });
        }

        const fileContent = fs.readFileSync(req.file.path, 'utf8');
        fs.rmSync(req.file.path);

        const decodedFile = CryptoJS.AES.decrypt(
            fileContent,
            process.env.APPLICATION_SECRET_BACKUP_CRYPT || '',
        );
        const originalFile = decodedFile.toString(CryptoJS.enc.Utf8);

        const productsApp = JSON.parse(originalFile);

        return res.json(productsApp);
    }
}

export default new ImportController();
