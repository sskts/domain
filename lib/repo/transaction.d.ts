/// <reference types="mongoose" />
import * as factory from '@motionpicture/sskts-factory';
import { Connection } from 'mongoose';
import TransactionModel from './mongoose/model/transaction';
/**
 * transaction repository
 * @class
 */
export declare class MongoRepository {
    readonly transactionModel: typeof TransactionModel;
    constructor(connection: Connection);
    startPlaceOrder(transactionAttributes: factory.transaction.placeOrder.IAttributes): Promise<factory.transaction.placeOrder.ITransaction>;
    /**
     * find placeOrder transaction by id
     * @param {string} transactionId transaction id
     */
    findPlaceOrderById(transactionId: string): Promise<factory.transaction.placeOrder.ITransaction>;
    /**
     * 進行中の取引を取得する
     */
    findPlaceOrderInProgressById(transactionId: string): Promise<factory.transaction.placeOrder.ITransaction>;
    /**
     * 取引中の所有者プロフィールを変更する
     * 匿名所有者として開始した場合のみ想定(匿名か会員に変更可能)
     */
    setCustomerContactsOnPlaceOrderInProgress(transactionId: string, contact: factory.transaction.placeOrder.ICustomerContact): Promise<void>;
    /**
     * confirm a placeOrder
     * 注文取引を確定する
     * @param transactionId transaction id
     * @param result transaction result
     */
    confirmPlaceOrder(transactionId: string, result: factory.transaction.placeOrder.IResult): Promise<void>;
    /**
     * タスクエクスポートリトライ
     * todo updatedAtを基準にしているが、タスクエクスポートトライ日時を持たせた方が安全か？
     * @param {number} intervalInMinutes
     */
    reexportTasks(intervalInMinutes: number): Promise<void>;
    /**
     * set task status exported by transaction id
     * IDでタスクをエクスポート済に変更する
     * @param transactionId transaction id
     * @param tasks task list
     */
    setTasksExportedById(transactionId: string, tasks: factory.task.ITask[]): Promise<void>;
    /**
     * 取引を期限切れにする
     */
    makeExpired(): Promise<void>;
    pushPaymentInfo(transactionId: string, authorizeAction: factory.action.authorize.creditCard.IAction): Promise<void>;
    pullPaymentInfo(transactionId: string, actionId: string): Promise<void>;
    addSeatReservation(transactionId: string, authorizeAction: factory.action.authorize.seatReservation.IAction): Promise<void>;
    removeSeatReservation(transactionId: string): Promise<void>;
    pushDiscountInfo(transactionId: string, authorizeAction: factory.action.authorize.mvtk.IAction): Promise<void>;
    pullDiscountInfo(transactionId: string, actionId: string): Promise<void>;
}
