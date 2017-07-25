/**
 * GMOオーソリファクトリー
 *
 * @namespace factory/authorization/gmo
 */
import * as GMO from '@motionpicture/gmo-service';
import * as AuthorizationFactory from '../authorization';
export declare type IObject = GMO.services.credit.IEntryTranArgs & GMO.services.credit.IExecTranArgs & {
    payType: string;
};
/**
 * GMOオーソリ
 */
export interface IAuthorization extends AuthorizationFactory.IAuthorization {
    result: GMO.services.credit.IExecTranResult;
    object: IObject;
}
export declare function create(args: {
    id?: string;
    price: number;
    result: GMO.services.credit.IExecTranResult;
    object: IObject;
}): IAuthorization;
