import * as AuthorizationFactory from '../authorization';
export interface IResult {
    kgygishCd: string;
    yykDvcTyp: string;
    trkshFlg: string;
    kgygishSstmZskyykNo: string;
    kgygishUsrZskyykNo: string;
    jeiDt: string;
    kijYmd: string;
    stCd: string;
    screnCd: string;
    knyknrNoInfo: IKnyknrNoInfo[];
    zskInfo: IZskInfo[];
    skhnCd: string;
}
export declare type IObject = any;
/**
 * 券種情報
 */
export interface IKnshInfo {
    knshTyp: string;
    miNum: string;
}
/**
 * 購入管理番号情報
 */
export interface IKnyknrNoInfo {
    knyknrNo: string;
    pinCd: string;
    knshInfo: IKnshInfo[];
}
/**
 * 座席情報
 */
export interface IZskInfo {
    zskCd: string;
}
/**
 * ムビチケ着券情報
 */
export interface IAuthorization extends AuthorizationFactory.IAuthorization {
    result: IResult;
    object: IObject;
}
export declare function create(args: {
    id?: string;
    price: number;
    result: IResult;
    object: IObject;
}): IAuthorization;
