"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * SSKTSError
 *
 * @class SSKTSError
 * @extends {Error}
 */
class SSKTSError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'SSKTSError';
        this.code = code;
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, SSKTSError.prototype);
    }
}
exports.default = SSKTSError;
