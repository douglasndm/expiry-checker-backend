import aws from 'aws-sdk';

aws.config.update({
    region: 'us-east-1',
});

const s3 = new aws.S3();

function getProductImageURL(code: string): string {
    const bucket = 'expirychecker-contents';
    const path = `products/${code}.jpg`;
    const signedUrlExpireSeconds = 60 * 5;

    const url = s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: path,
        Expires: signedUrlExpireSeconds,
    });

    return url;
}

export { getProductImageURL };
