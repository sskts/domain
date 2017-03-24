"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
/**
 * ArgumentError
 *
 * @class ArgumentError
 * @extends {Error}
 */
class ArgumentError extends Error {
    constructor(argumentName, message) {
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
exports.default = ArgumentError;
