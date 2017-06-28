import * as util from 'util';

import SSKTSError from '../error';
import ErrorCode from '../errorCode';

/**
 * DuplicateKeyError
 *
 * @class DuplicateKeyError
 * @extends {SSKTSError}
 */
export default class DuplicateKeyError extends SSKTSError {
    public readonly key: string;

    constructor(key: string, message?: string) {
        if (message === undefined || message.length === 0) {
            message = util.format('Duplicate key supplied: %s', key);
        }

        super(ErrorCode.DuplicateKey, message);

        this.key = key;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, DuplicateKeyError.prototype);
    }
}
