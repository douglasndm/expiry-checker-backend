import fs from 'fs';
import aws from 'aws-sdk';

aws.config.update({
    region: 'us-east-1',
});

const s3 = new aws.S3();

const bucket = 'expirychecker-contents';

function getProductImageURL(code: string): string {
    const path = `products/${code}.jpg`;
    const signedUrlExpireSeconds = 60 * 5;

    const url = s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: path,
        Expires: signedUrlExpireSeconds,
    });

    return url;
}

function uploadToS3(filePath: string): void {
    const file = fs.readFileSync(filePath);

    const filename = filePath.split('/').pop();

    const path = `teams/products/${filename}`;

    s3.upload(
        {
            Bucket: bucket,
            Key: path,
            Body: file,
        },
        (err, data) => {
            if (err) {
                console.error(err);
            }
            fs.unlinkSync(filePath);

            // return data.Location;
        },
    );
}

export { getProductImageURL, uploadToS3 };
