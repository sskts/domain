/**
 * GMOオーソリファクトリー
 *
 * @namespace factory/authorization/gmo
 */
import * as GMO from '@motionpicture/gmo-service';
import * as AuthorizationFactory from '../authorization';
/**
 * オーソリ対象インターフェース
 */
export declare type IObject = GMO.services.credit.IEntryTranArgs & GMO.services.credit.IExecTranArgs & {
    payType: string;
};
/**
 * GMOオーソリインターフェース
 */
export interface IAuthorization extends AuthorizationFactory.IAuthorization {
    /**
     * 承認結果
     */
    result: GMO.services.credit.IExecTranResult;
    /**
     * 承認対象
     */
    object: IObject;
}
export declare function create(args: {
    id?: string;
    price: number;
    result: GMO.services.credit.IExecTranResult;
    object: IObject;
}): IAuthorization;
