import * as util from 'util';

/**
 * ArgumentNullError
 *
 * @class ArgumentNullError
 * @extends {Error}
 */
export default class ArgumentNullError extends Error {
    public readonly argumentName: string;

    constructor(argumentName: string, message?: string) {
        if (message === undefined || message.length === 0) {
            message = util.format('Missing argument: %s', argumentName);
        }

        super(message);

        this.name = this.constructor.name;
        this.argumentName = argumentName;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ArgumentNullError.prototype);
    }
}
