import * as AuthorizationFactory from '../authorization';
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
export declare function create(args: {
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
}): IMvtkAuthorization;
