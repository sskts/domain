import * as util from 'util';

/**
 * ArgumentError
 *
 * @class ArgumentError
 * @extends {Error}
 */
export default class ArgumentError extends Error {
    public readonly argumentName: string;

    constructor(argumentName: string, message?: string) {
        if (message === undefined || message.length === 0) {
            message = util.format('Invalid or missing argument supplied: %s', argumentName);
        }

        super(message);

        this.name = this.constructor.name;
        this.argumentName = argumentName;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ArgumentError.prototype);
    }
}
