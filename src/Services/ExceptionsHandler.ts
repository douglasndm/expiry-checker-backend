import * as Sentry from '@sentry/node';

import { logDateTime } from '@utils/Logs/LogDateTime';

interface ICustomData {
	[data: string]: unknown;
}

function captureException(error: unknown, customData?: ICustomData): void {
	logDateTime();
	console.error(error);

	Sentry.captureException(error, customData);
}

export { captureException };
