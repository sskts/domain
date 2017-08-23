import * as util from 'util';

import SSKTSError from '../error';
import ErrorCode from '../errorCode';

/**
 * ArgumentNullError
 *
 * @class ArgumentNullError
 * @extends {SSKTSError}
 */
export default class ArgumentNullError extends SSKTSError {
    public readonly argumentName: string;

    constructor(argumentName: string, message?: string) {
        if (message === undefined || message.length === 0) {
            message = util.format('Missing argument: %s', argumentName);
        }

        super(ErrorCode.ArgumentNull, message);

        this.argumentName = argumentName;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ArgumentNullError.prototype);
    }
}
