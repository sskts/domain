"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const error_1 = require("../error");
const errorCode_1 = require("../errorCode");
/**
 * ArgumentError
 *
 * @class ArgumentError
 * @extends {SSKTSError}
 */
class ArgumentError extends error_1.default {
    constructor(argumentName, message) {
        if (message === undefined || message.length === 0) {
            message = util.format('Invalid or missing argument supplied: %s', argumentName);
        }
        super(errorCode_1.default.Argument, message);
        this.argumentName = argumentName;
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ArgumentError.prototype);
    }
}
exports.default = ArgumentError;
