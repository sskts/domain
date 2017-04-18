"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
/**
 * ArgumentNullError
 *
 * @class ArgumentNullError
 * @extends {Error}
 */
class ArgumentNullError extends Error {
    constructor(argumentName, message) {
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
exports.default = ArgumentNullError;
