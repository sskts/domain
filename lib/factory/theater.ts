/**
 * 劇場ファクトリー
 * todo jsdoc
 *
 * @namespace factory/theater
 */

import * as COA from '@motionpicture/coa-service';
import * as _ from 'underscore';

import ArgumentNullError from '../error/argumentNull';

import IMultilingualString from './multilingualString';
import TheaterWebsiteGroup from './theaterWebsiteGroup';

/**
 * 必須フィールド
 * COAからインポートされる想定
 *
 * @interface IRequiredFields
 * @memberof factory/theater
 */
export interface IRequiredFields {
    id: string;
    name: IMultilingualString;
    name_kana: string;
}

/**
 * GMO関連情報インターフェース
 *
 * @interface IGMO
 * @memberof factory/theater
 */
export interface IGMO {
    gmo: {
        site_id: string;
        shop_id: string;
        shop_pass: string;
    };
}

/**
 * ウェブサイト情報インターフェース
 *
 * @interface IWebsite
 * @memberof factory/theater
 */
export interface IWebsite {
    /**
     * ウェブサイト区分
     */
    group: TheaterWebsiteGroup;
    /**
     * ウェブサイト名
     */
    name: IMultilingualString;
    /**
     * URL
     */
    url: string;
}

/**
 * 追加情報インターフェース
 *
 * @interface IOptionalFields
 * @memberof factory/theater
 */
export interface IOptionalFields {
    address: IMultilingualString;
    /**
     * ウェブサイト情報リスト
     */
    websites: IWebsite[];
}

export type ITheater = IRequiredFields & IOptionalFields & IGMO;

/**
 * COAの劇場抽出結果からTheaterオブジェクトを作成する
 *
 * @param {COA.services.master.TheaterResult} theaterFromCOA
 * @returns {ITheaterWithoutGMO}
 * @memberof factory/theater
 */
export function createFromCOA(theaterFromCOA: COA.services.master.ITheaterResult): IRequiredFields {
    return {
        id: theaterFromCOA.theater_code,
        name: {
            ja: theaterFromCOA.theater_name,
            en: theaterFromCOA.theater_name_eng
        },
        name_kana: theaterFromCOA.theater_name_kana
    };
}

export function createInitialOptionalFields(): IOptionalFields & IGMO {
    return {
        address: {
            en: '',
            ja: ''
        },
        websites: [],
        gmo: {
            site_id: '',
            shop_id: '',
            shop_pass: ''
        }
    };
}

export function createWebsite(args: {
    group: TheaterWebsiteGroup;
    name: IMultilingualString;
    url: string;
}): IWebsite {
    if (_.isEmpty(args.group)) {
        throw new ArgumentNullError('group');
    }
    if (_.isEmpty(args.name.en)) {
        throw new ArgumentNullError('name.en');
    }
    if (_.isEmpty(args.name.ja)) {
        throw new ArgumentNullError('name.ja');
    }
    if (_.isEmpty(args.url)) {
        throw new ArgumentNullError('url');
    }

    return args;
}
