import { captureException as sentryCaptureException } from '@sentry/node';

function captureException(error: Error): void {
    console.error(error);

    if (process.env.DEV_MODE === 'false') {
        sentryCaptureException(error);
    }
}

export { captureException };
