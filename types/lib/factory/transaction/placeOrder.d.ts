/**
 * 注文取引ファクトリー
 *
 * @namespace factory/transaction/placeOrder
 */
import * as GMOAuthorizationFactory from '../authorization/gmo';
import * as MvtkAuthorizationFactory from '../authorization/mvtk';
import * as SeatReservationAuthorizationFactory from '../authorization/seatReservation';
import * as ClientUserFactory from '../clientUser';
import * as OrderFactory from '../order';
import * as OwnershipInfoFactory from '../ownershipInfo';
import * as ProgramMembershipFactory from '../programMembership';
import * as TaskFactory from '../task';
import * as TranstransactionFactory from '../transaction';
import TransactionStatusType from '../transactionStatusType';
import TransactionTasksExportationStatus from '../transactionTasksExportationStatus';
export declare type IAvailablePaymentInfo = GMOAuthorizationFactory.IAuthorization | MvtkAuthorizationFactory.IAuthorization;
export interface IPerformer {
    typeOf: string;
    id: string;
    name: string;
}
export interface IAgent {
    id: string;
    typeOf: string;
    givenName: string;
    familyName: string;
    email: string;
    telephone: string;
    memberOf?: ProgramMembershipFactory.IProgramMembership;
}
export interface IResult {
    order: OrderFactory.IOrder;
    ownershipInfos: OwnershipInfoFactory.IOwnership[];
}
export declare type IError = any;
export interface IObject {
    clientUser: ClientUserFactory.IClientUser;
    paymentInfo: IAvailablePaymentInfo[];
    seatReservation?: SeatReservationAuthorizationFactory.IAuthorization;
}
export interface ITransaction extends TranstransactionFactory.ITransaction {
    agent: IAgent;
    seller: IPerformer;
    result?: IResult;
    error?: IError;
    object: IObject;
}
export declare function create(args: {
    id?: string;
    status: TransactionStatusType;
    agent: IAgent;
    seller: IPerformer;
    result?: IResult;
    error?: IError;
    object: IObject;
    expires: Date;
    startDate?: Date;
    endDate?: Date;
    tasksExportedAt?: Date;
    tasksExportationStatus?: TransactionTasksExportationStatus;
    tasks?: TaskFactory.ITask[];
}): ITransaction;
