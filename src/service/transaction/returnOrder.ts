/**
 * 注文返品サービス
 * @namespace service.transaction.returnOrder
 */

import * as createDebug from 'debug';

import * as factory from '@motionpicture/sskts-factory';
import * as pug from 'pug';

import { MongoRepository as ActionRepo } from '../../repo/action';
import { MongoRepository as OrderRepo } from '../../repo/order';
import { MongoRepository as OrganizationRepo } from '../../repo/organization';
import { MongoRepository as TaskRepo } from '../../repo/task';
import { MongoRepository as TransactionRepo } from '../../repo/transaction';

const debug = createDebug('sskts-domain:service:transaction:returnOrder');

export type IStartOperation<T> = (actionRepo: ActionRepo, orderRepo: OrderRepo, transactionRepo: TransactionRepo) => Promise<T>;
export type ITransactionOperation<T> = (transactionRepo: TransactionRepo) => Promise<T>;
export type ITaskAndTransactionOperation<T> = (taskRepo: TaskRepo, transactionRepo: TransactionRepo) => Promise<T>;
export type IConfirmOperation<T> = (
    actionRepo: ActionRepo,
    transactionRepo: TransactionRepo,
    organizationRepo: OrganizationRepo
) => Promise<T>;

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
}): IStartOperation<factory.transaction.returnOrder.ITransaction> {
    return async (actionRepo: ActionRepo, orderRepo: OrderRepo, transactionRepo: TransactionRepo) => {
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

        const transactionResult = transaction.result;
        if (transactionResult === undefined) {
            throw new factory.errors.NotFound('transaction.result');
        }

        // 注文ステータスが配送済の場合のみ受け付け
        const order = await orderRepo.findByOrderNumber(transactionResult.order.orderNumber);
        if (order.orderStatus !== factory.orderStatus.OrderDelivered) {
            throw new factory.errors.Argument('transaction', 'order status is not OrderDelivered');
        }

        const actionsOnOrder = await actionRepo.findByOrderNumber(order.orderNumber);
        const payAction = <factory.action.trade.pay.IAction | undefined>actionsOnOrder.find(
            (a) => {
                return a.typeOf === factory.actionType.PayAction &&
                    a.actionStatus === factory.actionStatusType.CompletedActionStatus;
            }
        );
        // もし支払アクションがなければエラー
        if (payAction === undefined) {
            throw new factory.errors.NotFound('PayAction');
        }

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
): IConfirmOperation<factory.transaction.returnOrder.IResult> {
    return async (
        actionRepo: ActionRepo,
        transactionRepo: TransactionRepo,
        organizationRepo: OrganizationRepo
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
        const customerContact = placeOrderTransaction.object.customerContact;
        if (customerContact === undefined) {
            throw new factory.errors.NotFound('customerContact');
        }

        const seller = await organizationRepo.findMovieTheaterById(placeOrderTransaction.seller.id);

        const actionsOnOrder = await actionRepo.findByOrderNumber(placeOrderTransactionResult.order.orderNumber);
        const payAction = <factory.action.trade.pay.IAction | undefined>actionsOnOrder.find(
            (a) => {
                return a.typeOf === factory.actionType.PayAction &&
                    a.actionStatus === factory.actionStatusType.CompletedActionStatus;
            }
        );
        // もし支払アクションがなければエラー
        if (payAction === undefined) {
            throw new factory.errors.NotFound('PayAction');
        }

        const emailMessage = await createRefundEmail({
            transaction: placeOrderTransaction,
            customerContact: customerContact,
            order: placeOrderTransactionResult.order,
            seller: seller
        });
        const sendEmailMessageActionAttributes = factory.action.transfer.send.message.email.createAttributes({
            actionStatus: factory.actionStatusType.ActiveActionStatus,
            object: emailMessage,
            agent: placeOrderTransaction.seller,
            recipient: placeOrderTransaction.agent,
            potentialActions: {},
            purpose: placeOrderTransactionResult.order
        });
        const refundActionAttributes = factory.action.trade.refund.createAttributes({
            object: payAction,
            agent: placeOrderTransaction.seller,
            recipient: placeOrderTransaction.agent,
            purpose: placeOrderTransactionResult.order,
            potentialActions: {
                sendEmailMessage: sendEmailMessageActionAttributes
            }
        });
        const returnOrderActionAttributes = factory.action.transfer.returnAction.order.createAttributes({
            object: placeOrderTransactionResult.order,
            agent: placeOrderTransaction.agent,
            recipient: placeOrderTransaction.seller,
            potentialActions: {
                refund: refundActionAttributes
            }
        });
        const result: factory.transaction.returnOrder.IResult = {
        };
        const potentialActions: factory.transaction.returnOrder.IPotentialActions = {
            returnOrder: returnOrderActionAttributes
        };

        // ステータス変更
        debug('updating transaction...');
        await transactionRepo.confirmReturnOrder(
            transactionId,
            now,
            result,
            potentialActions
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
 * 返金メールを作成する
 */
export async function createRefundEmail(params: {
    transaction: factory.transaction.placeOrder.ITransaction;
    customerContact: factory.transaction.placeOrder.ICustomerContact;
    order: factory.order.IOrder;
    seller: factory.organization.movieTheater.IOrganization;
}): Promise<factory.creativeWork.message.email.ICreativeWork> {
    return new Promise<factory.creativeWork.message.email.ICreativeWork>((resolve, reject) => {
        const seller = params.transaction.seller;

        pug.renderFile(
            `${__dirname}/../../../emails/refundOrder/text.pug`,
            {
                familyName: params.customerContact.familyName,
                givenName: params.customerContact.givenName,
                confirmationNumber: params.order.confirmationNumber,
                price: params.order.price,
                sellerName: params.order.seller.name,
                sellerTelephone: params.seller.telephone
            },
            (renderMessageErr, message) => {
                if (renderMessageErr instanceof Error) {
                    reject(renderMessageErr);

                    return;
                }

                debug('message:', message);
                pug.renderFile(
                    `${__dirname}/../../../emails/refundOrder/subject.pug`,
                    {
                        sellerName: params.order.seller.name
                    },
                    (renderSubjectErr, subject) => {
                        if (renderSubjectErr instanceof Error) {
                            reject(renderSubjectErr);

                            return;
                        }

                        debug('subject:', subject);

                        resolve(factory.creativeWork.message.email.create({
                            identifier: `refundOrder-${params.order.orderNumber}`,
                            sender: {
                                typeOf: seller.typeOf,
                                name: seller.name,
                                // tslint:disable-next-line:no-suspicious-comment
                                email: 'noreply@ticket-cinemasunshine.com' // TODO どこかに保管
                            },
                            toRecipient: {
                                typeOf: params.transaction.agent.typeOf,
                                name: `${params.customerContact.familyName} ${params.customerContact.givenName}`,
                                email: params.customerContact.email
                            },
                            about: subject,
                            text: message
                        }));
                    }
                );
            }
        );
    });
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

                break;

            case factory.transactionStatusType.Expired:
                // 特にタスクなし

                break;

            default:
                throw new factory.errors.NotImplemented(`Transaction status "${transaction.status}" not implemented.`);
        }

        return Promise.all(taskAttributes.map(async (taskAttribute) => {
            return taskRepo.save(taskAttribute);
        }));
    };
}
