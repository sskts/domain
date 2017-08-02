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

export type IObject = any; // todo ムビチケ着券INに変更

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

export function create(args: {
    id?: string;
    price: number;
    result: IResult;
    object: IObject;
}): IAuthorization {
    if (!_.isNumber(args.price)) throw new ArgumentError('price', 'price should be number');
    if (args.price <= 0) throw new ArgumentError('price', 'price should be greater than 0');

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        group: AuthorizationGroup.MVTK,
        price: args.price,
        result: args.result,
        object: args.object
    };
}
