/**
 * ムビチケ着券情報ファクトリー
 *
 * @namespace MvtkAuthorizationFactory
 */
import * as validator from 'validator';
import * as AuthorizationFactory from '../authorization';
import AuthorizationGroup from '../authorizationGroup';
import ObjectId from '../objectId';

/**
 * 券種情報
 * @interface IKnshInfo
 */
export interface IKnshInfo {
    knsh_typ: string;
    mi_num: string;
}

/**
 * 購入管理番号情報
 * @interface IKnyknrNoInfo
 */
export interface IKnyknrNoInfo {
    knyknr_no: string;
    pin_cd: string;
    knsh_info: IKnshInfo[];
}

/**
 * 座席情報
 * @interface IZskInfo
 */
export interface IZskInfo {
    zsk_cd: string;
}

/**
 * ムビチケ着券情報
 */
export interface IMvtkAuthorization extends AuthorizationFactory.IAuthorization {
    kgygish_cd: string;
    yyk_dvc_typ: string;
    trksh_flg: string;
    kgygish_sstm_zskyyk_no: string;
    kgygish_usr_zskyyk_no: string;
    jei_dt: string;
    kij_ymd: string;
    st_cd: string;
    scren_cd: string;
    knyknr_no_info: IKnyknrNoInfo[];
    zsk_info: IZskInfo[];
    skhn_cd: string;
}

export function create(args: {
    id?: string;
    price: number;
    owner_from: string;
    owner_to: string;
    kgygish_cd: string;
    yyk_dvc_typ: string;
    trksh_flg: string;
    kgygish_sstm_zskyyk_no: string;
    kgygish_usr_zskyyk_no: string;
    jei_dt: string;
    kij_ymd: string;
    st_cd: string;
    scren_cd: string;
    knyknr_no_info: IKnyknrNoInfo[];
    zsk_info: IZskInfo[];
    skhn_cd: string;
}): IMvtkAuthorization {
    // todo validation
    if (validator.isEmpty(args.kgygish_cd)) throw new RangeError('kgygish_cd required.');
    if (validator.isEmpty(args.yyk_dvc_typ)) throw new RangeError('yyk_dvc_typ required.');
    if (validator.isEmpty(args.trksh_flg)) throw new RangeError('trksh_flg required.');
    if (validator.isEmpty(args.kgygish_sstm_zskyyk_no)) throw new RangeError('kgygish_sstm_zskyyk_no required.');
    if (validator.isEmpty(args.kgygish_usr_zskyyk_no)) throw new RangeError('kgygish_usr_zskyyk_no required.');
    if (validator.isEmpty(args.jei_dt)) throw new RangeError('jei_dt required.');
    if (validator.isEmpty(args.kij_ymd)) throw new RangeError('kij_ymd required.');
    if (validator.isEmpty(args.st_cd)) throw new RangeError('st_cd required.');
    if (validator.isEmpty(args.scren_cd)) throw new RangeError('scren_cd required.');
    if (validator.isEmpty(args.skhn_cd)) throw new RangeError('skhn_cd required.');
    if (validator.isEmpty(args.price.toString())) throw new RangeError('price required.');
    if (validator.isEmpty(args.owner_from)) throw new RangeError('owner_from required.');
    if (validator.isEmpty(args.owner_to)) throw new RangeError('owner_to required.');

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        group: AuthorizationGroup.MVTK,
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
