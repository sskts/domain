"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const error_1 = require("../error");
const errorCode_1 = require("../errorCode");
/**
 * DuplicateKeyError
 *
 * @class DuplicateKeyError
 * @extends {SSKTSError}
 */
class DuplicateKeyError extends error_1.default {
    constructor(key, message) {
        if (message === undefined || message.length === 0) {
            message = util.format('Duplicate key supplied: %s', key);
        }
        super(errorCode_1.default.DuplicateKey, message);
        this.key = key;
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, DuplicateKeyError.prototype);
    }
}
exports.default = DuplicateKeyError;
