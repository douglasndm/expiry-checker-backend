import fs from 'fs';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { GetObjectCommand, S3 } from '@aws-sdk/client-s3';

import AppError from '@errors/AppError';

const s3 = new S3({
    region: 'us-east-1',
});

const bucket = 'expirychecker-contents';
const signedUrlExpireSeconds = 60 * 5;

async function getProductImageURL(code: string): Promise<string> {
    const path = `products/${code}.jpg`;

    const url = await getSignedUrl(
        s3,
        new GetObjectCommand({
            Bucket: bucket,
            Key: path,
        }),
        {
            expiresIn: signedUrlExpireSeconds,
        },
    );

    return url;
}

interface getProductImageURLByFileNameProps {
    fileName: string;
    team_id: string;
}

async function getProductImageURLByFileName({
    fileName,
    team_id,
}: getProductImageURLByFileNameProps): Promise<string> {
    const path = `teams/${team_id}/products/${fileName}`;

    const url = await getSignedUrl(
        s3,
        new GetObjectCommand({
            Bucket: bucket,
            Key: path,
        }),
        {
            expiresIn: signedUrlExpireSeconds,
        },
    );

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
        });
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
        });
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
}: uploadToS3Props): Promise<string | undefined> {
    const file = fs.readFileSync(filePath);

    const filename = filePath.split('/').pop();

    const path = `teams/${team_id}/products/${filename}`;

    try {
        const response = await new Upload({
            client: s3,

            params: {
                Bucket: bucket,
                Key: path,
                Body: file,
                ContentType: 'image/jpeg',
            },
        }).done();

        return response.Location;
    } catch (error) {
        if (error instanceof Error) {
            throw new AppError({
                message: error.message,
            });
        }
    }
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
