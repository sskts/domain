import * as util from 'util';

import SSKTSError from '../error';
import ErrorCode from '../errorCode';

/**
 * ArgumentError
 *
 * @class ArgumentError
 * @extends {SSKTSError}
 */
export default class ArgumentError extends SSKTSError {
    public readonly argumentName: string;

    constructor(argumentName: string, message?: string) {
        if (message === undefined || message.length === 0) {
            message = util.format('Invalid or missing argument supplied: %s', argumentName);
        }

        super(ErrorCode.Argument, message);

        this.argumentName = argumentName;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ArgumentError.prototype);
    }
}
