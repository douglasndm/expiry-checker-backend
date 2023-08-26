import AppError from '@errors/AppError';

import { s3, bucket } from '../AWS';

async function deleteTeamFromS3(team_id: string): Promise<void> {
    const path = `teams/${team_id}}`;

    try {
        const listParams = {
            Bucket: bucket,
            Prefix: path,
        };

        const listedObjects = await s3.listObjectsV2(listParams).promise();

        if (!listedObjects.Contents || listedObjects.Contents.length === 0)
            return;

        interface DeleteObjects {
            Objects: {
                Key: string;
            };
        }

        const deleteParams = {
            Bucket: bucket,
            Delete: { Objects: [] },
        };

        listedObjects.Contents.forEach(({ Key }) => {
            deleteParams.Delete.Objects.push({ Key });
        });

        await s3.deleteObjects(deleteParams).promise();

        if (listedObjects.IsTruncated) await emptyS3Directory(bucket, dir);
    } catch (error) {
        if (error instanceof Error) {
            throw new AppError({
                message: error.message,
            });
        }
    }
}

export { deleteTeamFromS3 };
