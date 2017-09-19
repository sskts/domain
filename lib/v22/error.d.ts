/**
 * SSKTSError
 *
 * @class SSKTSError
 * @extends {Error}
 */
export default class SSKTSError extends Error {
    readonly code: string;
    constructor(code: string, message?: string);
}
