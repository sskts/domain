"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ムビチケ着券情報ファクトリー
 *
 * @namespace MvtkAuthorizationFactory
 */
const validator = require("validator");
const argument_1 = require("../../error/argument");
const argumentNull_1 = require("../../error/argumentNull");
const authorizationGroup_1 = require("../authorizationGroup");
const objectId_1 = require("../objectId");
function create(args) {
    // todo validation
    if (validator.isEmpty(args.kgygish_cd))
        throw new argumentNull_1.default('kgygish_cd');
    if (validator.isEmpty(args.yyk_dvc_typ))
        throw new argumentNull_1.default('yyk_dvc_typ');
    if (validator.isEmpty(args.trksh_flg))
        throw new argumentNull_1.default('trksh_flg');
    if (validator.isEmpty(args.kgygish_sstm_zskyyk_no))
        throw new argumentNull_1.default('kgygish_sstm_zskyyk_no');
    if (validator.isEmpty(args.kgygish_usr_zskyyk_no))
        throw new argumentNull_1.default('kgygish_usr_zskyyk_no');
    if (validator.isEmpty(args.jei_dt))
        throw new argumentNull_1.default('jei_dt');
    if (validator.isEmpty(args.kij_ymd))
        throw new argumentNull_1.default('kij_ymd');
    if (validator.isEmpty(args.st_cd))
        throw new argumentNull_1.default('st_cd');
    if (validator.isEmpty(args.scren_cd))
        throw new argumentNull_1.default('scren_cd');
    if (validator.isEmpty(args.skhn_cd))
        throw new argumentNull_1.default('skhn_cd');
    if (validator.isEmpty(args.price.toString()))
        throw new argumentNull_1.default('price');
    if (validator.isEmpty(args.owner_from))
        throw new argumentNull_1.default('owner_from');
    if (validator.isEmpty(args.owner_to))
        throw new argumentNull_1.default('owner_to');
    if (!Array.isArray(args.knyknr_no_info))
        throw new argument_1.default('knyknr_no_info shoud be array');
    if (args.knyknr_no_info.length === 0)
        throw new argument_1.default('knyknr_no_info should not be empty');
    if (!Array.isArray(args.zsk_info))
        throw new argument_1.default('zsk_info shoud be array');
    if (args.zsk_info.length === 0)
        throw new argument_1.default('zsk_info should not be empty');
    if (validator.isEmpty(args.price.toString()))
        throw new argument_1.default('price', 'price should be number');
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
