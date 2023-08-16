import fs from 'fs';
import aws from 'aws-sdk';

import AppError from '@errors/AppError';

aws.config.update({
    region: 'us-east-1',
});

const s3 = new aws.S3();

const bucket = 'expirychecker-contents';
const signedUrlExpireSeconds = 60 * 5;

function getProductImageURL(code: string): string {
    const path = `products/${code}.jpg`;

    const url = s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: path,
        Expires: signedUrlExpireSeconds,
    });

    return url;
}

function getProductImageURLByFileName(fileName: string): string {
    const path = `teams/products/${fileName}`;

    const url = s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: path,
        Expires: signedUrlExpireSeconds,
    });

    return url;
}

async function uploadToS3(filePath: string): Promise<string> {
    const file = fs.readFileSync(filePath);

    const filename = filePath.split('/').pop();

    const path = `teams/products/${filename}`;

    try {
        const response = await s3
            .upload({
                Bucket: bucket,
                Key: path,
                Body: file,
            })
            .promise();

        return response.Location;
    } catch (error) {
        if (error instanceof Error) {
            throw new AppError({
                message: error.message,
            });
        }
    }
}

export { getProductImageURL, getProductImageURLByFileName, uploadToS3 };
