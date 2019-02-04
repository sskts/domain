/**
 * 注文返品取引サービス
 */
import * as createDebug from 'debug';
import * as pug from 'pug';

import { MongoRepository as ActionRepo } from '../../repo/action';
import { MongoRepository as OrderRepo } from '../../repo/order';
import { MongoRepository as SellerRepo } from '../../repo/seller';
import { MongoRepository as TaskRepo } from '../../repo/task';
import { MongoRepository as TransactionRepo } from '../../repo/transaction';

import * as factory from '../../factory';

const debug = createDebug('sskts-domain:service:transaction:returnOrder');

export type IStartOperation<T> = (repos: {
    action: ActionRepo;
    order: OrderRepo;
    transaction: TransactionRepo;
}) => Promise<T>;
export type ITaskAndTransactionOperation<T> = (repos: {
    task: TaskRepo;
    transaction: TransactionRepo;
}) => Promise<T>;
export type IConfirmOperation<T> = (repos: {
    action: ActionRepo;
    transaction: TransactionRepo;
    seller: SellerRepo;
}) => Promise<T>;
export type ISeller = factory.seller.IOrganization<factory.seller.IAttributes<factory.organizationType>>;

/**
 * 注文返品取引開始
 */
export function start(
    params: factory.transaction.returnOrder.IStartParamsWithoutDetail
): IStartOperation<factory.transaction.returnOrder.ITransaction> {
    return async (repos: {
        action: ActionRepo;
        order: OrderRepo;
        transaction: TransactionRepo;
    }) => {
        // 返品対象の取引取得
        const order = await repos.order.findByOrderNumber({ orderNumber: params.object.order.orderNumber });

        // 注文ステータスが配送済の場合のみ受け付け
        if (order.orderStatus !== factory.orderStatus.OrderDelivered) {
            throw new factory.errors.Argument('Order Number', `Invalid Order Status: ${order.orderStatus}`);
        }

        const placeOrderTransactions = await repos.transaction.search<factory.transactionType.PlaceOrder>({
            typeOf: factory.transactionType.PlaceOrder,
            result: {
                order: { orderNumbers: [params.object.order.orderNumber] }
            }
        });
        const placeOrderTransaction = placeOrderTransactions.shift();
        if (placeOrderTransaction === undefined) {
            throw new factory.errors.NotFound('Transaction');
        }

        // 決済がある場合、請求書の状態を検証
        if (order.paymentMethods.length > 0) {
            // const invoices = await repos.invoice.search({ referencesOrder: { orderNumbers: [order.orderNumber] } });
            // const allPaymentCompleted = invoices.every((invoice) => invoice.paymentStatus === factory.paymentStatusType.PaymentComplete);
            // if (!allPaymentCompleted) {
            //     throw new factory.errors.Argument('order.orderNumber', 'Payment not completed');
            // }
        }

        // 検証
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        // if (!params.forcibly) {
        //     validateRequest();
        // }

        const returnOrderAttributes: factory.transaction.IStartParams<factory.transactionType.ReturnOrder> = {
            typeOf: factory.transactionType.ReturnOrder,
            agent: {
                typeOf: factory.personType.Person,
                id: params.agent.id,
                url: ''
            },
            object: {
                clientUser: <any>params.object.clientUser,
                order: order,
                cancellationFee: params.object.cancellationFee,
                reason: params.object.reason
            },
            expires: params.expires
        };

        let returnOrderTransaction: factory.transaction.returnOrder.ITransaction;
        try {
            returnOrderTransaction = await repos.transaction.start<factory.transactionType.ReturnOrder>(returnOrderAttributes);
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
                    throw new factory.errors.Argument('Order number', 'Already returned');
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
// tslint:disable-next-line:max-func-body-length
export function confirm(params: {
    id: string;
    agent: { id: string };
}): IConfirmOperation<factory.transaction.returnOrder.IResult> {
    // tslint:disable-next-line:max-func-body-length
    return async (repos: {
        action: ActionRepo;
        seller: SellerRepo;
        transaction: TransactionRepo;
    }) => {
        const transaction = await repos.transaction.findInProgressById({
            typeOf: factory.transactionType.ReturnOrder,
            id: params.id
        });
        if (transaction.agent.id !== params.agent.id) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        const order = transaction.object.order;
        const seller = await repos.seller.findById({
            id: order.seller.id
        });

        const actionsOnOrder = await repos.action.searchByOrderNumber(order);
        const payActions = <factory.action.trade.pay.IAction<factory.paymentMethodType>[]>actionsOnOrder
            .filter((a) => a.typeOf === factory.actionType.PayAction)
            .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus);

        const emailMessage = await createRefundEmail({
            customerContact: order.customer,
            order: order,
            seller: seller
        });
        const sendEmailMessageActionAttributes: factory.action.transfer.send.message.email.IAttributes = {
            typeOf: factory.actionType.SendAction,
            object: emailMessage,
            agent: seller,
            recipient: order.customer,
            potentialActions: {},
            purpose: order
        };

        // クレジットカード返金アクション
        const refundCreditCardActions = (<factory.action.trade.pay.IAction<factory.paymentMethodType.CreditCard>[]>payActions)
            .filter((a) => a.object[0].paymentMethod.typeOf === factory.paymentMethodType.CreditCard)
            .map((a): factory.action.trade.refund.IAttributes<factory.paymentMethodType.CreditCard> => {
                return {
                    typeOf: <factory.actionType.RefundAction>factory.actionType.RefundAction,
                    object: a,
                    agent: {
                        typeOf: seller.typeOf,
                        id: seller.id,
                        name: seller.name,
                        url: seller.url
                    },
                    recipient: order.customer,
                    purpose: order,
                    potentialActions: {
                        sendEmailMessage: sendEmailMessageActionAttributes
                    }
                };
            });

        // ポイント返金アクション
        const refundAccountActions = (<factory.action.trade.pay.IAction<factory.paymentMethodType.Account>[]>payActions)
            .filter((a) => a.object[0].paymentMethod.typeOf === factory.paymentMethodType.Account)
            .map((a): factory.action.trade.refund.IAttributes<factory.paymentMethodType.Account> => {
                return {
                    typeOf: <factory.actionType.RefundAction>factory.actionType.RefundAction,
                    object: a,
                    agent: seller,
                    recipient: order.customer,
                    purpose: order,
                    potentialActions: {
                        sendEmailMessage: sendEmailMessageActionAttributes
                    }
                };
            });

        // ムビチケ着券返金アクション
        const refundMovieTicketActions: factory.action.trade.refund.IAction<factory.paymentMethodType.MovieTicket>[] = [];

        // ポイントインセンティブの数だけ、返却アクションを作成
        const givePointActions = <factory.action.transfer.give.pointAward.IAction[]>actionsOnOrder
            .filter((a) => a.typeOf === factory.actionType.GiveAction)
            .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
            .filter((a) => a.object.typeOf === factory.action.transfer.give.pointAward.ObjectType.PointAward);
        const returnPointAwardActions = givePointActions.map(
            (a): factory.action.transfer.returnAction.pointAward.IAttributes => {
                return {
                    typeOf: factory.actionType.ReturnAction,
                    object: a,
                    agent: order.customer,
                    recipient: seller,
                    potentialActions: {}
                };
            }
        );

        const returnOrderActionAttributes: factory.action.transfer.returnAction.order.IAttributes = {
            typeOf: <factory.actionType.ReturnAction>factory.actionType.ReturnAction,
            object: order,
            agent: order.customer,
            recipient: seller,
            purpose: order,
            potentialActions: {
                refundCreditCard: refundCreditCardActions,
                refundAccount: refundAccountActions,
                refundMovieTicket: refundMovieTicketActions,
                returnPointAward: returnPointAwardActions
            }
        };
        const result: factory.transaction.returnOrder.IResult = {
        };
        const potentialActions: factory.transaction.returnOrder.IPotentialActions = {
            returnOrder: returnOrderActionAttributes
        };

        // ステータス変更
        debug('updating transaction...');
        await repos.transaction.confirmReturnOrder({
            id: params.id,
            result: result,
            potentialActions: potentialActions
        });

        return result;
    };
}

/**
 * 返品取引バリデーション
 */
export function validateRequest() {
    // 現時点で特にバリデーション内容なし
}

/**
 * 返金メールを作成する
 */
export async function createRefundEmail(params: {
    // transaction: factory.transaction.placeOrder.ITransaction;
    customerContact: factory.transaction.placeOrder.ICustomerContact;
    order: factory.order.IOrder;
    seller: ISeller;
}): Promise<factory.creativeWork.message.email.ICreativeWork> {
    return new Promise<factory.creativeWork.message.email.ICreativeWork>((resolve, reject) => {
        // const seller = params.transaction.seller;
        const seller = params.order.seller;

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

                        const email: factory.creativeWork.message.email.ICreativeWork = {
                            typeOf: factory.creativeWorkType.EmailMessage,
                            identifier: `refundOrder-${params.order.orderNumber}`,
                            name: `refundOrder-${params.order.orderNumber}`,
                            sender: {
                                typeOf: seller.typeOf,
                                name: seller.name,
                                email: 'noreply@ticket-cinemasunshine.com'
                            },
                            toRecipient: {
                                typeOf: params.order.customer.typeOf,
                                name: `${params.customerContact.familyName} ${params.customerContact.givenName}`,
                                email: params.customerContact.email
                            },
                            about: subject,
                            text: message
                        };
                        resolve(email);
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
    return async (repos: {
        task: TaskRepo;
        transaction: TransactionRepo;
    }) => {
        const transaction = await repos.transaction.startExportTasks({
            typeOf: factory.transactionType.ReturnOrder,
            status: status
        });
        if (transaction === null) {
            return;
        }

        // 失敗してもここでは戻さない(RUNNINGのまま待機)
        await exportTasksById(transaction.id)(repos);

        await repos.transaction.setTasksExportedById(transaction);
    };
}

/**
 * ID指定で取引のタスク出力
 */
export function exportTasksById(transactionId: string): ITaskAndTransactionOperation<factory.task.ITask<factory.taskName>[]> {
    // tslint:disable-next-line:max-func-body-length
    return async (repos: {
        task: TaskRepo;
        transaction: TransactionRepo;
    }) => {
        const transaction = await repos.transaction.findById({
            typeOf: factory.transactionType.ReturnOrder,
            id: transactionId
        });

        const taskAttributes: factory.task.IAttributes<factory.taskName>[] = [];
        switch (transaction.status) {
            case factory.transactionStatusType.Confirmed:
                // 注文返品タスク
                const returnOrderTask: factory.task.IAttributes<factory.taskName.ReturnOrder> = {
                    name: factory.taskName.ReturnOrder,
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        orderNumber: transaction.object.order.orderNumber
                    }
                };
                taskAttributes.push(returnOrderTask);

                break;

            case factory.transactionStatusType.Expired:
                // 特にタスクなし

                break;

            default:
                throw new factory.errors.NotImplemented(`Transaction status "${transaction.status}" not implemented.`);
        }

        return Promise.all(taskAttributes.map(async (taskAttribute) => {
            return repos.task.save(taskAttribute);
        }));
    };
}
