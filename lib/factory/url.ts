/**
 * URLファクトリー
 *
 * @namespace factory/url
 */

import * as url from 'url';

export type IURL = string;

export function create(urlObject: url.URL): IURL {
    return urlObject.toString();
}
