/**
 * OAuthサービス
 *
 * @namespace OAuthService
 */
"use strict";
const createDebug = require("debug");
const jwt = require("jsonwebtoken");
const debug = createDebug('sskts-domain:service:oauth');
const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 1800;
/**
 * アクセストークンを発行する
 *
 * @see https://tools.ietf.org/html/rfc7523
 */
function sign(assertion, scope) {
    return new Promise((resolve, reject) => {
        if (assertion !== process.env.SSKTS_API_REFRESH_TOKEN) {
            return reject(new Error('invalid assertion.'));
        }
        jwt.sign({
            scope: scope
        }, process.env.SSKTS_API_SECRET, {
            expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS
        }, (err, encoded) => {
            debug(err, encoded);
            if (err) {
                reject(err);
            }
            else {
                resolve(encoded);
            }
        });
    });
}
exports.sign = sign;
/**
 * アクセストークンを検証する
 *
 * @see https://tools.ietf.org/html/rfc7523
 */
function verify(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.SSKTS_API_SECRET, (err, decoded) => {
            debug(err, decoded);
            if (err) {
                reject(err);
            }
            else {
                resolve(decoded);
            }
        });
    });
}
exports.verify = verify;
