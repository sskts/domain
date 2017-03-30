/**
 * ムビチケ着券情報ファクトリー
 *
 * @namespace MvtkAuthorizationFactory
 */
import * as _ from 'underscore';

import ArgumentError from '../../error/argument';
import ArgumentNullError from '../../error/argumentNull';

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
    if (_.isEmpty(args.kgygish_cd)) throw new ArgumentNullError('kgygish_cd');
    if (_.isEmpty(args.yyk_dvc_typ)) throw new ArgumentNullError('yyk_dvc_typ');
    if (_.isEmpty(args.trksh_flg)) throw new ArgumentNullError('trksh_flg');
    if (_.isEmpty(args.kgygish_sstm_zskyyk_no)) throw new ArgumentNullError('kgygish_sstm_zskyyk_no');
    if (_.isEmpty(args.kgygish_usr_zskyyk_no)) throw new ArgumentNullError('kgygish_usr_zskyyk_no');
    if (_.isEmpty(args.jei_dt)) throw new ArgumentNullError('jei_dt');
    if (_.isEmpty(args.kij_ymd)) throw new ArgumentNullError('kij_ymd');
    if (_.isEmpty(args.st_cd)) throw new ArgumentNullError('st_cd');
    if (_.isEmpty(args.scren_cd)) throw new ArgumentNullError('scren_cd');
    if (_.isEmpty(args.skhn_cd)) throw new ArgumentNullError('skhn_cd');
    if (_.isEmpty(args.owner_from)) throw new ArgumentNullError('owner_from');
    if (_.isEmpty(args.owner_to)) throw new ArgumentNullError('owner_to');

    if (!Array.isArray(args.knyknr_no_info)) throw new ArgumentError('knyknr_no_info', 'knyknr_no_info shoud be array');
    if (args.knyknr_no_info.length === 0) throw new ArgumentError('knyknr_no_info', 'knyknr_no_info should not be empty');
    if (!Array.isArray(args.zsk_info)) throw new ArgumentError('zsk_info', 'zsk_info shoud be array');
    if (args.zsk_info.length === 0) throw new ArgumentError('zsk_info', 'zsk_info should not be empty');

    if (!_.isNumber(args.price)) throw new ArgumentError('price', 'price should be number');
    if (args.price <= 0) throw new ArgumentError('price', 'price should be greater than 0');

    args.knyknr_no_info.forEach((knyknrNoInfo) => {
        if (_.isEmpty(knyknrNoInfo.knyknr_no)) throw new ArgumentNullError('knyknr_no_info.knyknr_no');
        if (_.isEmpty(knyknrNoInfo.pin_cd)) throw new ArgumentNullError('knyknr_no_info.pin_cd');
        if (!Array.isArray(knyknrNoInfo.knsh_info)) {
            throw new ArgumentError('knyknr_no_info.knsh_info', 'knyknr_no_info.knsh_info shoud be array');
        }
        if (knyknrNoInfo.knsh_info.length === 0) {
            throw new ArgumentError('knyknr_no_info.knsh_info', 'knyknr_no_info.knsh_info  should not be empty');
        }

        knyknrNoInfo.knsh_info.forEach((knshInfo) => {
            if (_.isEmpty(knshInfo.knsh_typ)) throw new ArgumentNullError('knyknr_no_info.knsh_info.knsh_typ');
            if (_.isEmpty(knshInfo.mi_num)) throw new ArgumentNullError('knyknr_no_info.knsh_info.mi_num');
        });
    });

    args.zsk_info.forEach((zskInfo) => {
        if (_.isEmpty(zskInfo.zsk_cd)) throw new ArgumentNullError('knyknr_no_info.knyknr_no');
    });

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
