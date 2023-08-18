import { Request, Response } from 'express';
import { rmSync, unlinkSync } from 'fs';
import sharp from 'sharp';

import { removeProductImageFromS3, uploadToS3 } from '@services/AWS';

import { updateProduct } from '@utils/Product/Update';

import { getProduct } from '@functions/Product';

import AppError from '@errors/AppError';

class UploadController {
    async store(req: Request, res: Response): Promise<Response> {
        if (!req.file) {
            throw new AppError({
                message: 'File was not sent',
            });
        }

        if (!req.file.mimetype.includes('image')) {
            rmSync(req.file.path);

            throw new AppError({
                message: 'File is not valid',
            });
        }

        const { team_id, product_id } = req.params;

        const product = await getProduct({
            product_id,
        });

        if (!product.code) {
            throw new AppError({
                message: "Product doesn't have a code",
                statusCode: 400,
            });
        }

        const [_, ext] = req.file.filename.split('.');
        const newName = `${product.id}.${ext}`;

        const newPath = req.file.path.replace(req.file.filename, newName);

        await sharp(req.file.path)
            .resize({ width: 800 })
            .toFile(`${newPath}`)
            .then(async () => {
                if (req.file) unlinkSync(req.file.path);

                const response = await uploadToS3({
                    filePath: newPath,
                    team_id,
                });

                if (response) {
                    const name = response.split('/').pop();

                    await updateProduct({
                        id: product_id,
                        image: name,
                    });
                } else {
                    throw new AppError({
                        message: 'Fail on upload to S3',
                        internalErrorCode: 43,
                        statusCode: 500,
                    });
                }
            })
            .finally(() => {
                unlinkSync(newPath);
            });

        return res.json({ message: 'Uploaded' });
    }

    async delete(req: Request, res: Response): Promise<Response> {
        const { team_id, product_id } = req.params;

        const product = await getProduct({
            product_id,
        });

        if (product.image) {
            removeProductImageFromS3({ fileName: product.image, team_id });
        }

        await updateProduct({
            id: product_id,
            image: null,
        });

        return res.send();
    }
}

export default new UploadController();
