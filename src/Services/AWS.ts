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

interface getProductImageURLByFileNameProps {
    fileName: string;
    team_id: string;
}

function getProductImageURLByFileName({
    fileName,
    team_id,
}: getProductImageURLByFileNameProps): string {
    const path = `teams/${team_id}/products/${fileName}`;

    const url = s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: path,
        Expires: signedUrlExpireSeconds,
    });

    return url;
}

interface removeProductImageFromS3Props {
    fileName: string;
    team_id: string;
}

function removeProductImageFromS3({
    fileName,
    team_id,
}: removeProductImageFromS3Props): void {
    const path = `teams/${team_id}/products/${fileName}`;

    try {
        s3.deleteObject({
            Bucket: bucket,
            Key: path,
        }).promise();
    } catch (error) {
        if (error instanceof Error) {
            throw new AppError({
                message: error.message,
            });
        }
    }
}

function removeManyImages(files: string[], team_id: string): void {
    if (files.length <= 0) return; // this fixes "The XML you provided was not well-formed or did not validate against our published schema" from aws sdk
    const path = `teams/${team_id}/products/`;

    try {
        s3.deleteObjects({
            Bucket: bucket,
            Delete: {
                Objects: files.map(file => ({
                    Key: path + file,
                })),
            },
        }).promise();
    } catch (error) {
        if (error instanceof Error) {
            throw new AppError({
                message: error.message,
            });
        }
    }
}

interface uploadToS3Props {
    filePath: string;
    team_id: string;
}

async function uploadToS3({
    filePath,
    team_id,
}: uploadToS3Props): Promise<string | null> {
    const file = fs.readFileSync(filePath);

    const filename = filePath.split('/').pop();

    const path = `teams/${team_id}/products/${filename}`;

    try {
        const response = await s3
            .upload({
                Bucket: bucket,
                Key: path,
                Body: file,
                ContentType: 'image/jpeg',
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

    return null;
}

export {
    getProductImageURL,
    getProductImageURLByFileName,
    uploadToS3,
    removeProductImageFromS3,
    removeManyImages,
    s3,
    bucket,
};
