/**
 * 劇場組織ファクトリー
 *
 * @namespace factory/organization/movieTheater
 */
import IMultilingualString from '../multilingualString';
import * as OrganizationFactory from '../organization';
import * as URLFactory from '../url';
/**
 * GMOショップ情報インターフェース
 */
export interface IGMOInfo {
    /**
     * サイトID
     */
    siteId: string;
    /**
     * ショップID
     */
    shopId: string;
    /**
     * ショップパス
     */
    shopPass: string;
}
/**
 * 場所インターフェース
 */
export interface ILocation {
    /**
     * スキーマタイプ
     */
    typeOf: string;
    /**
     * 枝番号
     * COAの劇場コードにあたります。
     */
    branchCode: string;
    /**
     * 場所名称
     */
    name: IMultilingualString;
}
/**
 * 親組織インターフェース
 */
export interface IParentOrganization {
    /**
     * スキーマタイプ
     */
    typeOf: string;
    /**
     * 組織識別子
     */
    identifier: string;
    /**
     * 組織名称
     */
    name: IMultilingualString;
}
export interface IOrganizationWithoutGMOInfo extends OrganizationFactory.IOrganization {
    /**
     * 組織識別子
     */
    identifier: string;
    /**
     * 劇場名称
     */
    name: IMultilingualString;
    /**
     * 枝番号
     * COAの劇場コードにあたります。
     */
    branchCode: string;
    /**
     * 親組織
     */
    parentOrganization: IParentOrganization;
    /**
     * 場所
     */
    location: ILocation;
    /**
     * 電話番号
     */
    telephone: string;
    /**
     * 劇場ポータルサイトURL
     */
    url: URLFactory.IURL;
}
/**
 * ローカルビジネス組織としての劇場
 */
export declare type IOrganization = IOrganizationWithoutGMOInfo & {
    /**
     * GMO情報
     */
    gmoInfo: IGMOInfo;
};
export declare function create(args: {
    name: IMultilingualString;
    branchCode: string;
    gmoInfo: IGMOInfo;
    parentOrganization: IParentOrganization;
    location: ILocation;
    telephone: string;
    url: URLFactory.IURL;
}): IOrganization;
