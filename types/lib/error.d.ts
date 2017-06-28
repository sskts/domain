/**
 * SSKTSError
 *
 * @class SSKTSError
 * @extends {Error}
 */
export default class SSKTSError extends Error {
    readonly code: number;
    constructor(code: number, message?: string);
}
