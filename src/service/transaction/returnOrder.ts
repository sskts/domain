/**
 * 注文返品サービス
 * @namespace service.transaction.returnOrder
 */

import * as createDebug from 'debug';

import * as factory from '@motionpicture/sskts-factory';

import { MongoRepository as TaskRepo } from '../../repo/task';
import { MongoRepository as TransactionRepo } from '../../repo/transaction';

const debug = createDebug('sskts-domain:service:transaction:returnOrder');

export type ITransactionOperation<T> = (transactionRepo: TransactionRepo) => Promise<T>;
export type ITaskAndTransactionOperation<T> = (taskRepo: TaskRepo, transactionRepo: TransactionRepo) => Promise<T>;

/**
 * 予約キャンセル処理
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export function start(params: {
    /**
     * 取引期限
     */
    expires: Date;
    /**
     * 主体者ID
     */
    agentId: string;
    /**
     * APIクライアント
     */
    clientUser: factory.clientUser.IClientUser;
    /**
     * 取引ID
     */
    transactionId: string;
    /**
     * キャンセル手数料
     */
    cancellationFee: number;
    /**
     * 強制的に返品するかどうか
     * 管理者の判断で返品する場合、バリデーションをかけない
     */
    forcibly: boolean;
    /**
     * 返品理由
     */
    reason: factory.transaction.returnOrder.Reason;
}): ITransactionOperation<factory.transaction.returnOrder.ITransaction> {
    return async (transactionRepo: TransactionRepo) => {
        const now = new Date();

        // 返品対象の取引取得
        const transaction = await transactionRepo.transactionModel.findOne(
            {
                typeOf: factory.transactionType.PlaceOrder,
                status: factory.transactionStatusType.Confirmed,
                _id: params.transactionId
            }
        ).exec().then((doc) => {
            if (doc === null) {
                throw new factory.errors.NotFound('transaction');
            }

            return <factory.transaction.placeOrder.ITransaction>doc.toObject();
        });

        const transactionResult = <factory.transaction.placeOrder.IResult>transaction.result;

        // tslint:disable-next-line:no-suspicious-comment
        // TODO
        // // クレジットカード決済の場合、取引状態が実売上でなければまだ返品できない
        // if (transaction.object.paymentMethod === factory.paymentMethodType.CreditCard && creditCardSales === undefined) {
        //     throw new factory.errors.Argument('transaction', 'Status not Sales.');
        // }

        // 検証
        if (!params.forcibly) {
            validateRequest(now, transactionResult.order.acceptedOffers[0].itemOffered.reservationFor.startDate);
        }

        const returnOrderAttributes = factory.transaction.returnOrder.createAttributes({
            status: factory.transactionStatusType.InProgress,
            agent: {
                typeOf: factory.personType.Person,
                id: params.agentId,
                url: ''
            },
            object: {
                clientUser: params.clientUser,
                transaction: transaction,
                cancellationFee: params.cancellationFee,
                reason: params.reason
            },
            expires: params.expires,
            startDate: now,
            tasksExportationStatus: factory.transactionTasksExportationStatus.Unexported
        });

        let returnOrderTransaction: factory.transaction.returnOrder.ITransaction;
        try {
            returnOrderTransaction = await transactionRepo.transactionModel.create(returnOrderAttributes)
                .then((doc) => <factory.transaction.returnOrder.ITransaction>doc.toObject());
        } catch (error) {
            if (error.name === 'MongoError') {
                // 同一取引に対して返品取引を作成しようとすると、MongoDBでE11000 duplicate key errorが発生する
                // name: 'MongoError',
                // message: 'E11000 duplicate key error ...',
                // code: 11000,

                // tslint:disable-next-line:no-single-line-block-comment
                /* istanbul ignore else */
                // tslint:disable-next-line:no-magic-numbers
                if (error.code === 11000) {
                    throw new factory.errors.AlreadyInUse('transaction', ['object.transaction'], 'Already returned.');
                }
            }

            throw error;
        }

        return returnOrderTransaction;
    };
}

/**
 * 取引確定
 */
export function confirm(
    agentId: string,
    transactionId: string
): ITransactionOperation<factory.transaction.returnOrder.IResult> {
    return async (
        transactionRepo: TransactionRepo
    ) => {
        const now = new Date();
        const transaction = await transactionRepo.findReturnOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        // 結果作成
        const placeOrderTransaction = transaction.object.transaction;
        const placeOrderTransactionResult = placeOrderTransaction.result;
        if (placeOrderTransactionResult === undefined) {
            throw new Error('Result of placeOrder transaction to return undefined.');
        }
        const returnOrderActionAttributes = factory.action.transfer.returnAction.order.createAttributes({
            actionStatus: factory.actionStatusType.CompletedActionStatus,
            object: placeOrderTransactionResult.order,
            agent: placeOrderTransaction.agent,
            recipient: placeOrderTransaction.seller,
            startDate: new Date()
        });
        const returnPayActionAttributes = factory.action.transfer.returnAction.pay.createAttributes({
            actionStatus: factory.actionStatusType.CompletedActionStatus,
            // tslint:disable-next-line:no-suspicious-comment
            object: <any>{ // TODO アクションリポジトリーから支払アクションを取得する
                orderNumber: placeOrderTransactionResult.order.orderNumber
            },
            agent: placeOrderTransaction.seller,
            recipient: placeOrderTransaction.agent,
            startDate: new Date()
        });
        const result: factory.transaction.returnOrder.IResult = {
            returnOrderActionAttributes: returnOrderActionAttributes,
            returnPayActionAttributes: returnPayActionAttributes
        };

        // ステータス変更
        debug('updating transaction...');
        await transactionRepo.confirmReturnOrder(
            transactionId,
            now,
            result
        );

        return result;
    };
}

/**
 * キャンセル検証
 */
function validateRequest(__1: Date, __2: Date) {
    // 入塔予定日の3日前までキャンセル可能(3日前を過ぎていたらエラー)
    // const cancellableThrough = moment(performanceStartDate).add(-CANCELLABLE_DAYS + 1, 'days').toDate();
    // if (cancellableThrough <= now) {
    //     throw new factory.errors.Argument('performance_day', 'キャンセルできる期限を過ぎています。');
    // }
}

/**
 * 返品取引のタスクをエクスポートする
 */
export function exportTasks(status: factory.transactionStatusType) {
    return async (taskRepo: TaskRepo, transactionRepo: TransactionRepo) => {
        const statusesTasksExportable = [factory.transactionStatusType.Expired, factory.transactionStatusType.Confirmed];
        if (statusesTasksExportable.indexOf(status) < 0) {
            throw new factory.errors.Argument('status', `transaction status should be in [${statusesTasksExportable.join(',')}]`);
        }

        const transaction = await transactionRepo.transactionModel.findOneAndUpdate(
            {
                typeOf: factory.transactionType.ReturnOrder,
                status: status,
                tasksExportationStatus: factory.transactionTasksExportationStatus.Unexported
            },
            { tasksExportationStatus: factory.transactionTasksExportationStatus.Exporting },
            { new: true }
        ).exec()
            .then((doc) => (doc === null) ? null : <factory.transaction.returnOrder.ITransaction>doc.toObject());

        if (transaction === null) {
            return;
        }

        // 失敗してもここでは戻さない(RUNNINGのまま待機)
        await exportTasksById(transaction.id)(taskRepo, transactionRepo);

        await transactionRepo.setTasksExportedById(transaction.id);
    };
}

/**
 * ID指定で取引のタスク出力
 */
export function exportTasksById(transactionId: string): ITaskAndTransactionOperation<factory.task.ITask[]> {
    // tslint:disable-next-line:max-func-body-length
    return async (taskRepo: TaskRepo, transactionRepo: TransactionRepo) => {
        const transaction = await transactionRepo.findReturnOrderById(transactionId);

        const taskAttributes: factory.task.IAttributes[] = [];
        switch (transaction.status) {
            case factory.transactionStatusType.Confirmed:
                // 注文返品タスク
                taskAttributes.push(factory.task.returnOrder.createAttributes({
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                }));

                // 売上取消タスク
                taskAttributes.push(factory.task.returnCreditCardSales.createAttributes({
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                }));

                // メール送信タスク
                const placeOrderTransaction = transaction.object.transaction;
                const customerContact = placeOrderTransaction.object.customerContact;
                const placeOrderTransactionResult = placeOrderTransaction.result;
                if (customerContact !== undefined && placeOrderTransactionResult !== undefined) {
                    const emailMessage = factory.creativeWork.message.email.create({
                        identifier: `returnOrderTransaction-${transactionId}`,
                        sender: {
                            typeOf: placeOrderTransaction.seller.typeOf,
                            name: placeOrderTransaction.seller.name,
                            email: 'noreply@ticket-cinemasunshine.com'
                        },
                        toRecipient: {
                            typeOf: placeOrderTransaction.agent.typeOf,
                            name: `${customerContact.givenName} ${customerContact.familyName}`,
                            email: customerContact.email
                        },
                        about: `${placeOrderTransaction.seller.name} 返品完了`,
                        text: `${customerContact.givenName} ${customerContact.familyName} 様
----------------------------------------

下記購入について、返金処理が完了いたしました。

またのご利用、心よりお待ちしております。

----------------------------------------

◆購入番号 ：${placeOrderTransactionResult.order.orderInquiryKey.confirmationNumber}
◆合計金額 ：${placeOrderTransactionResult.order.price}円

※このアドレスは送信専用です。返信はできませんのであらかじめご了承下さい。

----------------------------------------

シネマサンシャイン

http://www.cinemasunshine.co.jp/

----------------------------------------
`
                    });

                    taskAttributes.push(factory.task.sendEmailNotification.createAttributes({
                        status: factory.taskStatus.Ready,
                        runsAt: new Date(), // なるはやで実行
                        remainingNumberOfTries: 10,
                        lastTriedAt: null,
                        numberOfTried: 0,
                        executionResults: [],
                        data: {
                            transactionId: transaction.id,
                            emailMessage: emailMessage
                        }
                    }));
                }

                break;

            case factory.transactionStatusType.Expired:

                break;

            default:
                throw new factory.errors.NotImplemented(`Transaction status "${transaction.status}" not implemented.`);
        }

        return Promise.all(taskAttributes.map(async (taskAttribute) => {
            return taskRepo.save(taskAttribute);
        }));
    };
}
