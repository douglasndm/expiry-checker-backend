import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { s3, bucket, signedUrlExpireSeconds } from '@services/AWS';

async function getProductImageURLByFileName(fileName: string): Promise<string> {
    const path = `products/${fileName}`;

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

export { getProductImageURLByFileName };
