/**
 * `購入アクションファクトリー
 *
 * @namespace factory/action/buyAction
 */
import * as ActionFactory from '../action';
import * as ActionEventFactory from '../actionEvent';
import ActionStatusType from '../actionStatusType';
import ActionTasksExportationStatus from '../actionTasksExportationStatus';
import * as ClientUserFactory from '../clientUser';
import * as OrderFactory from '../order';
import * as OrderInquiryKeyFactory from '../orderInquiryKey';
import * as OwnershipInfoFactory from '../ownershipInfo';
import * as TaskFactory from '../task';
export interface IPerformer {
    typeOf: string;
    id: string;
    name: string;
}
export interface IResult {
    order: OrderFactory.IOrder;
    ownershipInfos: OwnershipInfoFactory.IOwnership[];
}
export declare type IError = any;
export interface IObject {
    clientUser: ClientUserFactory.IClientUser;
    actionEvents: ActionEventFactory.IActionEvent[];
    orderInquiryKey?: OrderInquiryKeyFactory.IOrderInquiryKey;
}
export interface IAction extends ActionFactory.IAction {
    agent: IPerformer;
    seller: IPerformer;
    result?: IResult;
    error?: IError;
    object: IObject;
}
export declare function create(args: {
    id?: string;
    actionStatus: ActionStatusType;
    agent: IPerformer;
    seller: IPerformer;
    result?: IResult;
    error?: IError;
    object: IObject;
    expires: Date;
    startDate?: Date;
    endDate?: Date;
    tasksExportedAt?: Date;
    tasksExportationStatus?: ActionTasksExportationStatus;
    tasks?: TaskFactory.ITask[];
}): IAction;
