import fs from 'fs';
import { Request, Response } from 'express';
import CryptoJS from 'crypto-js';
import * as Yup from 'yup';

import AppError from '@errors/AppError';

import { convertExportFile } from '@functions/Apps/Classic/ConvertExportFile';
import { saveManyCategories } from '@functions/Apps/Classic/Categories';
import { getUser } from '@functions/Users';

import Cache from '@services/Cache';

class ImportController {
    async store(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            team_id: Yup.string().required().uuid(),
        });

        try {
            await schema.validate(req.params);
        } catch (err) {
            if (err instanceof Error)
                throw new AppError({
                    message: err.message,
                    statusCode: 400,
                    internalErrorCode: 1,
                });
        }

        if (!process.env.APPLICATION_SECRET_BACKUP_CRYPT) {
            throw new AppError({
                message: 'Server is missing decrypt key',
                statusCode: 500,
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

        const cache = new Cache();
        await cache.invalidade(`products-from-teams:${team_id}`);

        const user = await getUser(req.userId || '');
        if (!user) return res.status(400).send();

        if (parsedFile.categories) {
            const { categories } = parsedFile;

            const savedCategories = await saveManyCategories({
                categories,
                team_id,
            });

            if (parsedFile.products) {
                const productsSaved = await convertExportFile({
                    oldProducts: parsedFile.products,
                    team_id,
                    categories: savedCategories,
                    brands: parsedFile.brands,
                    user_id: user.id,
                });

                return res.json(productsSaved);
            }
        }

        if (parsedFile.products) {
            const { products } = parsedFile;

            const productsSaved = await convertExportFile({
                oldProducts: products,
                team_id,
                brands: parsedFile.brands,
                user_id: user.id,
            });

            return res.json(productsSaved);
        }
        const productsSaved = await convertExportFile({
            oldProducts: parsedFile,
            team_id,
            brands: parsedFile.brands,
            user_id: user.id,
        });

        return res.json(productsSaved);
    }
}

export default new ImportController();
