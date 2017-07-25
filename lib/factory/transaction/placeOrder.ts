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
import TransactionType from '../transactionType';

export type IAvailablePaymentInfo = GMOAuthorizationFactory.IAuthorization | MvtkAuthorizationFactory.IAuthorization;

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

export type IError = any;

export interface IObject {
    clientUser: ClientUserFactory.IClientUser; // 取引進行クライアントユーザー
    paymentInfo: IAvailablePaymentInfo[]; // 決済情報
    seatReservation?: SeatReservationAuthorizationFactory.IAuthorization; // 座席予約情報
}

export interface ITransaction extends TranstransactionFactory.ITransaction {
    agent: IAgent;
    seller: IPerformer;
    result?: IResult;
    error?: IError;
    object: IObject;
}

export function create(args: {
    id?: string;
    status: TransactionStatusType;
    agent: IAgent
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
}): ITransaction {
    return {
        ...TranstransactionFactory.create({
            typeOf: TransactionType.PlaceOrder,
            status: args.status,
            agent: args.agent,
            result: args.result,
            error: args.error,
            object: args.object,
            expires: args.expires,
            startDate: args.startDate,
            endDate: args.endDate,
            tasksExportedAt: args.tasksExportedAt,
            tasksExportationStatus: args.tasksExportationStatus,
            tasks: args.tasks
        }),
        ...{
            seller: args.seller,
            object: args.object
        }
    };
}
