import SSKTSError from '../error';
/**
 * DuplicateKeyError
 *
 * @class DuplicateKeyError
 * @extends {SSKTSError}
 */
export default class DuplicateKeyError extends SSKTSError {
    readonly key: string;
    constructor(key: string, message?: string);
}
