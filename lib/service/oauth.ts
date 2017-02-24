/**
 * OAuthサービス
 *
 * @namespace OAuthService
 */

import * as createDebug from 'debug';
import * as jwt from 'jsonwebtoken';

import AccessTokenScope from '../model/accessTokenScope';

const debug = createDebug('sskts-domain:service:oauth');
const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 1800;

/**
 * アクセストークンを発行する
 *
 * @see https://tools.ietf.org/html/rfc7523
 */
export function sign(assertion: string, scope: AccessTokenScope) {
    return new Promise((resolve: (token: string) => void, reject: (err: Error) => void) => {
        if (assertion !== process.env.SSKTS_API_REFRESH_TOKEN) {
            return reject(new Error('invalid assertion.'));
        }

        jwt.sign(
            {
                scope: scope
            },
            process.env.SSKTS_API_SECRET,
            {
                expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS
            },
            (err, encoded) => {
                debug(err, encoded);
                if (err) {
                    reject(err);
                } else {
                    resolve(encoded);
                }
            }
        );
    });
}

/**
 * アクセストークンを検証する
 *
 * @see https://tools.ietf.org/html/rfc7523
 */
export function verify(token: string) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, <string>process.env.SSKTS_API_SECRET, (err, decoded) => {
            debug(err, decoded);
            if (err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });

    });
}
