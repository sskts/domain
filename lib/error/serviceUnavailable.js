"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("../error");
const errorCode_1 = require("../errorCode");
/**
 * ServiceUnavailableError
 *
 * @class ServiceUnavailableError
 * @extends {SSKTSError}
 */
class ServiceUnavailableError extends error_1.default {
    constructor(message) {
        if (message === undefined || message.length === 0) {
            message = 'service unavailable temporarily';
        }
        super(errorCode_1.default.ServiceUnavailable, message);
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
    }
}
exports.default = ServiceUnavailableError;
