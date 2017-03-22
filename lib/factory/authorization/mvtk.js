"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ムビチケ着券情報ファクトリー
 *
 * @namespace MvtkAuthorizationFacroty
 */
const validator = require("validator");
const authorizationGroup_1 = require("../authorizationGroup");
const objectId_1 = require("../objectId");
function create(args) {
    // todo validation
    if (validator.isEmpty(args.kgygish_cd))
        throw new Error('kgygish_cd required.');
    if (validator.isEmpty(args.yyk_dvc_typ))
        throw new Error('yyk_dvc_typ required.');
    if (validator.isEmpty(args.trksh_flg))
        throw new Error('trksh_flg required.');
    if (validator.isEmpty(args.kgygish_sstm_zskyyk_no))
        throw new Error('kgygish_sstm_zskyyk_no required.');
    if (validator.isEmpty(args.kgygish_usr_zskyyk_no))
        throw new Error('kgygish_usr_zskyyk_no required.');
    if (validator.isEmpty(args.jei_dt))
        throw new Error('jei_dt required.');
    if (validator.isEmpty(args.kij_ymd))
        throw new Error('kij_ymd required.');
    if (validator.isEmpty(args.st_cd))
        throw new Error('st_cd required.');
    if (validator.isEmpty(args.scren_cd))
        throw new Error('scren_cd required.');
    if (validator.isEmpty(args.skhn_cd))
        throw new Error('skhn_cd required.');
    if (validator.isEmpty(args.price.toString()))
        throw new Error('price required.');
    if (validator.isEmpty(args.owner_from.toString()))
        throw new Error('owner_from required.');
    if (validator.isEmpty(args.owner_to.toString()))
        throw new Error('owner_to required.');
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
