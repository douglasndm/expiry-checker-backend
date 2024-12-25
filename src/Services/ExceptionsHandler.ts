import * as Sentry from '@sentry/node';

interface ICustomData {
    [data: string]: unknown;
}

function captureException(error: Error, customData?: ICustomData): void {
    console.error(error);

    Sentry.captureException(error, customData);
}

export { captureException };
