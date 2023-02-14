export class DcatUsError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.name = 'DcatUsError';
        this.statusCode = statusCode;
    }
}