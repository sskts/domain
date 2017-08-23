/**
 * SSKTSError
 *
 * @class SSKTSError
 * @extends {Error}
 */
export default class SSKTSError extends Error {
    public readonly code: string;

    constructor(code: string, message?: string) {
        super(message);

        this.name = 'SSKTSError';
        this.code = code;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, SSKTSError.prototype);
    }
}
