"use strict";
/**
 * 劇場ファクトリー
 * todo jsdoc
 *
 * @namespace factory/theater
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("underscore");
const argumentNull_1 = require("../error/argumentNull");
/**
 * COAの劇場抽出結果からTheaterオブジェクトを作成する
 *
 * @param {COA.services.master.TheaterResult} theaterFromCOA
 * @returns {ITheaterWithoutGMO}
 * @memberof factory/theater
 */
function createFromCOA(theaterFromCOA) {
    return {
        id: theaterFromCOA.theater_code,
        name: {
            ja: theaterFromCOA.theater_name,
            en: theaterFromCOA.theater_name_eng
        },
        name_kana: theaterFromCOA.theater_name_kana
    };
}
exports.createFromCOA = createFromCOA;
function createInitialOptionalFields() {
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
exports.createInitialOptionalFields = createInitialOptionalFields;
function createWebsite(args) {
    if (_.isEmpty(args.group)) {
        throw new argumentNull_1.default('group');
    }
    if (_.isEmpty(args.name.en)) {
        throw new argumentNull_1.default('name.en');
    }
    if (_.isEmpty(args.name.ja)) {
        throw new argumentNull_1.default('name.ja');
    }
    if (_.isEmpty(args.url)) {
        throw new argumentNull_1.default('url');
    }
    return args;
}
exports.createWebsite = createWebsite;
