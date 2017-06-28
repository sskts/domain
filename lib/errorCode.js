"use strict";
/**
 * エラーコード
 *
 * @module errorCode
 */
Object.defineProperty(exports, "__esModule", { value: true });
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["Argument"] = 11] = "Argument";
    ErrorCode[ErrorCode["ArgumentNull"] = 12] = "ArgumentNull";
    ErrorCode[ErrorCode["DuplicateKey"] = 13] = "DuplicateKey";
})(ErrorCode || (ErrorCode = {}));
exports.default = ErrorCode;
