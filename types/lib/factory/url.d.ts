/// <reference types="node" />
/**
 * URLファクトリー
 *
 * @namespace factory/url
 */
import * as url from 'url';
export declare type IURL = string;
export declare function create(urlObject: url.URL): IURL;
