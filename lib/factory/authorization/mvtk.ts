/**
 * ムビチケ着券情報ファクトリー
 *
 * @namespace factory/authorization/mvtk
 */

import * as _ from 'underscore';

import ArgumentError from '../../error/argument';

import * as AuthorizationFactory from '../authorization';
import AuthorizationGroup from '../authorizationGroup';
import ObjectId from '../objectId';

export interface IResult { // todo ムビチケ着券OUTに変更
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

export type IObject = any; // todo ムビチケ着券INに変更

/**
 * 券種情報
 * @interface IKnshInfo
 * @memberof tobereplaced$
 */
export interface IKnshInfo {
    knsh_typ: string;
    mi_num: string;
}

/**
 * 購入管理番号情報
 * @interface IKnyknrNoInfo
 * @memberof tobereplaced$
 */
export interface IKnyknrNoInfo {
    knyknr_no: string;
    pin_cd: string;
    knsh_info: IKnshInfo[];
}

/**
 * 座席情報
 * @interface IZskInfo
 * @memberof tobereplaced$
 */
export interface IZskInfo {
    zsk_cd: string;
}

/**
 * ムビチケ着券情報
 * @memberof tobereplaced$
 */
export interface IAuthorization extends AuthorizationFactory.IAuthorization {
    result: IResult;
    object: IObject;
}

export function create(args: {
    id?: string;
    price: number;
    agent: AuthorizationFactory.IOwner;
    recipient: AuthorizationFactory.IOwner;
    result: IResult;
    object: IObject;
}): IAuthorization {
    if (!_.isNumber(args.price)) throw new ArgumentError('price', 'price should be number');
    if (args.price <= 0) throw new ArgumentError('price', 'price should be greater than 0');

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        group: AuthorizationGroup.MVTK,
        price: args.price,
        agent: args.agent,
        recipient: args.recipient,
        result: args.result,
        object: args.object
    };
}
