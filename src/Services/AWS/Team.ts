import AppError from '@errors/AppError';

import { s3, bucket } from '../AWS';

async function deleteTeamFromS3(team_id: string): Promise<void> {
	const path = `teams/${team_id}`;

	try {
		const listParams = {
			Bucket: bucket,
			Prefix: path,
		};

		const listedObjects = await s3.listObjectsV2(listParams);

		if (!listedObjects.Contents || listedObjects.Contents.length === 0)
			return;

		const deleteParams = {
			Bucket: bucket,
			Delete: {
				Objects: [] as { Key: string }[],
			},
		};

		listedObjects.Contents.forEach(({ Key }) => {
			if (Key) {
				deleteParams.Delete.Objects.push({ Key });
			}
		});

		await s3.deleteObjects(deleteParams);

		if (listedObjects.IsTruncated) {
			await deleteTeamFromS3(team_id);
		}
	} catch (error) {
		if (error instanceof Error) {
			throw new AppError({
				message: error.message,
			});
		}
	}
}

export { deleteTeamFromS3 };
