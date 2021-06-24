interface IAppError {
    message: string;
    statusCode?: number;
    internalErrorCode?: number;
}

class AppError {
    public readonly message: string;

    public readonly statusCode: number;

    public readonly errorCode: number | undefined;

    constructor({ message, statusCode = 400, internalErrorCode }: IAppError) {
        this.message = message;
        this.statusCode = statusCode;
        this.errorCode = internalErrorCode;
    }
}

export default AppError;
