import * as AuthorizationFactory from '../authorization';
export interface IResult {
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
export declare type IObject = any;
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
export declare function create(args: {
    id?: string;
    price: number;
    agent: AuthorizationFactory.IOwner;
    recipient: AuthorizationFactory.IOwner;
    result: IResult;
    object: IObject;
}): IAuthorization;
