import fs from 'fs';
import { Request, Response } from 'express';
import CryptoJS from 'crypto-js';
import * as Yup from 'yup';

import { convertExportFile } from '../../Functions/Controledevalidade/ConvertExportFile';

class ImportController {
    async store(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            team_id: Yup.string().required().uuid(),
        });

        if (!(await schema.isValid(req.params))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        try {
            const { team_id } = req.params;

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

            const products = await convertExportFile({
                oldProducts: productsApp,
                team_id,
            });

            return res.json(products);
        } catch (err) {
            return res.status(500).json(err);
        }
    }
}

export default new ImportController();
