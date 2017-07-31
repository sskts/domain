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

/**
 * 販売者インターフェース
 */
export interface ISeller {
    /**
     * スキーマタイプ
     */
    typeOf: string;
    /**
     * ID
     */
    id: string;
    /**
     * 販売者名称
     */
    name: string;
}

/**
 * 購入者インターフェース
 */
export interface IAgent {
    id: string;
    /**
     * スキーマタイプ
     */
    typeOf: string;
    /**
     * めい
     */
    givenName: string;
    /**
     * せい
     */
    familyName: string;
    /**
     * メールアドレス
     */
    email: string;
    /**
     * 電話番号
     */
    telephone: string;
    /**
     * 参加している会員プログラム
     */
    memberOf?: ProgramMembershipFactory.IProgramMembership;
}

/**
 * 取引結果インターフェース
 */
export interface IResult {
    /**
     * 注文データ
     */
    order: OrderFactory.IOrder;
    /**
     * 購入者に与えられる所有権リスト
     */
    ownershipInfos: OwnershipInfoFactory.IOwnership[];
}

/**
 * エラーインターフェース
 */
export type IError = any;

/**
 * 取引対象物インターフェース
 */
export interface IObject {
    /**
     * 取引進行クライアントユーザー
     */
    clientUser: ClientUserFactory.IClientUser;
    /**
     * 決済情報リスト
     */
    paymentInfos: IAvailablePaymentInfo[];
    /**
     * 座席予約情報
     */
    seatReservation?: SeatReservationAuthorizationFactory.IAuthorization;
}

/**
 * 注文取引インターフェース
 */
export interface ITransaction extends TranstransactionFactory.ITransaction {
    /**
     * 購入者
     */
    agent: IAgent;
    /**
     * 販売者
     */
    seller: ISeller;
    /**
     * 取引の結果発生するもの
     */
    result?: IResult;
    /**
     * 取引に関するエラー
     */
    error?: IError;
    /**
     * 取引の対象物
     * 座席仮予約、クレジットカードのオーソリなど、取引を構成する承認などが含まれます。
     */
    object: IObject;
}

export function create(args: {
    id?: string;
    status: TransactionStatusType;
    agent: IAgent
    seller: ISeller;
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
