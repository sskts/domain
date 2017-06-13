"use strict";
/**
 * ムビチケ着券情報ファクトリー
 *
 * @namespace factory/authorization/mvtk
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("underscore");
const argument_1 = require("../../error/argument");
const argumentNull_1 = require("../../error/argumentNull");
const authorizationGroup_1 = require("../authorizationGroup");
const objectId_1 = require("../objectId");
/**
 *
 * @memberof tobereplaced$
 */
function create(args) {
    if (_.isEmpty(args.kgygish_cd))
        throw new argumentNull_1.default('kgygish_cd');
    if (_.isEmpty(args.yyk_dvc_typ))
        throw new argumentNull_1.default('yyk_dvc_typ');
    if (_.isEmpty(args.trksh_flg))
        throw new argumentNull_1.default('trksh_flg');
    if (_.isEmpty(args.kgygish_sstm_zskyyk_no))
        throw new argumentNull_1.default('kgygish_sstm_zskyyk_no');
    if (_.isEmpty(args.kgygish_usr_zskyyk_no))
        throw new argumentNull_1.default('kgygish_usr_zskyyk_no');
    if (_.isEmpty(args.jei_dt))
        throw new argumentNull_1.default('jei_dt');
    if (_.isEmpty(args.kij_ymd))
        throw new argumentNull_1.default('kij_ymd');
    if (_.isEmpty(args.st_cd))
        throw new argumentNull_1.default('st_cd');
    if (_.isEmpty(args.scren_cd))
        throw new argumentNull_1.default('scren_cd');
    if (_.isEmpty(args.skhn_cd))
        throw new argumentNull_1.default('skhn_cd');
    if (_.isEmpty(args.owner_from))
        throw new argumentNull_1.default('owner_from');
    if (_.isEmpty(args.owner_to))
        throw new argumentNull_1.default('owner_to');
    if (!Array.isArray(args.knyknr_no_info))
        throw new argument_1.default('knyknr_no_info', 'knyknr_no_info shoud be array');
    if (args.knyknr_no_info.length === 0)
        throw new argument_1.default('knyknr_no_info', 'knyknr_no_info should not be empty');
    if (!Array.isArray(args.zsk_info))
        throw new argument_1.default('zsk_info', 'zsk_info shoud be array');
    if (args.zsk_info.length === 0)
        throw new argument_1.default('zsk_info', 'zsk_info should not be empty');
    if (!_.isNumber(args.price))
        throw new argument_1.default('price', 'price should be number');
    if (args.price <= 0)
        throw new argument_1.default('price', 'price should be greater than 0');
    args.knyknr_no_info.forEach((knyknrNoInfo) => {
        if (_.isEmpty(knyknrNoInfo.knyknr_no))
            throw new argumentNull_1.default('knyknr_no_info.knyknr_no');
        if (_.isEmpty(knyknrNoInfo.pin_cd))
            throw new argumentNull_1.default('knyknr_no_info.pin_cd');
        if (!Array.isArray(knyknrNoInfo.knsh_info)) {
            throw new argument_1.default('knyknr_no_info.knsh_info', 'knyknr_no_info.knsh_info shoud be array');
        }
        if (knyknrNoInfo.knsh_info.length === 0) {
            throw new argument_1.default('knyknr_no_info.knsh_info', 'knyknr_no_info.knsh_info  should not be empty');
        }
        knyknrNoInfo.knsh_info.forEach((knshInfo) => {
            if (_.isEmpty(knshInfo.knsh_typ))
                throw new argumentNull_1.default('knyknr_no_info.knsh_info.knsh_typ');
            if (_.isEmpty(knshInfo.mi_num))
                throw new argumentNull_1.default('knyknr_no_info.knsh_info.mi_num');
        });
    });
    args.zsk_info.forEach((zskInfo) => {
        if (_.isEmpty(zskInfo.zsk_cd))
            throw new argumentNull_1.default('zsk_info.zsk_cd');
    });
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        group: authorizationGroup_1.default.MVTK,
        price: args.price,
        owner_from: args.owner_from,
        owner_to: args.owner_to,
        kgygish_cd: args.kgygish_cd,
        yyk_dvc_typ: args.yyk_dvc_typ,
        trksh_flg: args.trksh_flg,
        kgygish_sstm_zskyyk_no: args.kgygish_sstm_zskyyk_no,
        kgygish_usr_zskyyk_no: args.kgygish_usr_zskyyk_no,
        jei_dt: args.jei_dt,
        kij_ymd: args.kij_ymd,
        st_cd: args.st_cd,
        scren_cd: args.scren_cd,
        knyknr_no_info: args.knyknr_no_info,
        zsk_info: args.zsk_info,
        skhn_cd: args.skhn_cd
    };
}
exports.create = create;
