/**
 * 注文取引サービス
 */
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';

import { MongoRepository as TaskRepo } from '../../repo/task';
import { MongoRepository as TransactionRepo } from '../../repo/transaction';

const debug = createDebug('sskts-domain:service:transaction:placeOrder');

export type ITaskAndTransactionOperation<T> = (repos: {
    task: TaskRepo;
    transaction: TransactionRepo;
}) => Promise<T>;

/**
 * ひとつの取引のタスクをエクスポートする
 */
export function exportTasks(status: factory.transactionStatusType) {
    return async (repos: {
        task: TaskRepo;
        transaction: TransactionRepo;
    }) => {
        const transaction = await repos.transaction.startExportTasks(factory.transactionType.PlaceOrder, status);
        if (transaction === null) {
            return;
        }

        // 失敗してもここでは戻さない(RUNNINGのまま待機)
        await exportTasksById(transaction.id)(repos);
        await repos.transaction.setTasksExportedById(transaction.id);
    };
}

/**
 * ID指定で取引のタスク出力
 */
export function exportTasksById(transactionId: string): ITaskAndTransactionOperation<factory.task.ITask[]> {
    // tslint:disable-next-line:max-func-body-length
    return async (repos: {
        task: TaskRepo;
        transaction: TransactionRepo;
    }) => {
        const transaction = await repos.transaction.findById(factory.transactionType.PlaceOrder, transactionId);

        const taskAttributes: factory.task.IAttributes[] = [];

        // ウェブフックタスクを追加
        const webhookUrl =
            // tslint:disable-next-line:max-line-length
            `${process.env.TELEMETRY_API_ENDPOINT}/organizations/project/${process.env.PROJECT_ID}/tasks/AnalyzePlaceOrder`;
        const triggerWebhookTaskAttributes: factory.task.IAttributes = {
            name: <any>'triggerWebhook',
            status: factory.taskStatus.Ready,
            runsAt: new Date(), // なるはやで実行
            remainingNumberOfTries: 3,
            lastTriedAt: null,
            numberOfTried: 0,
            executionResults: [],
            data: {
                url: webhookUrl,
                payload: { transaction: transaction }
            }
        };
        taskAttributes.push(
            triggerWebhookTaskAttributes
        );

        switch (transaction.status) {
            case factory.transactionStatusType.Confirmed:
                const placeOrderTaskAttributes: factory.task.placeOrder.IAttributes = {
                    name: factory.taskName.PlaceOrder,
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                };
                taskAttributes.push(placeOrderTaskAttributes);

                break;

            // 期限切れor中止の場合は、タスクリストを作成する
            case factory.transactionStatusType.Canceled:
            case factory.transactionStatusType.Expired:
                const cancelSeatReservationTaskAttributes: factory.task.cancelSeatReservation.IAttributes = {
                    name: factory.taskName.CancelSeatReservation,
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                };
                const cancelCreditCardTaskAttributes: factory.task.cancelCreditCard.IAttributes = {
                    name: factory.taskName.CancelCreditCard,
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                };
                const cancelMvtkTaskAttributes: factory.task.cancelMvtk.IAttributes = {
                    name: factory.taskName.CancelMvtk,
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                };
                const cancelPecorinoTaskAttributes: factory.task.cancelPecorino.IAttributes = {
                    name: factory.taskName.CancelPecorino,
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                };
                const cancelPecorinoAwardTaskAttributes: factory.task.cancelPecorinoAward.IAttributes = {
                    name: factory.taskName.CancelPecorinoAward,
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                };
                taskAttributes.push(
                    cancelSeatReservationTaskAttributes,
                    cancelCreditCardTaskAttributes,
                    cancelMvtkTaskAttributes,
                    cancelPecorinoTaskAttributes,
                    cancelPecorinoAwardTaskAttributes
                );

                break;

            default:
                throw new factory.errors.NotImplemented(`Transaction status "${transaction.status}" not implemented.`);
        }
        debug('taskAttributes prepared', taskAttributes);

        return Promise.all(taskAttributes.map(async (taskAttribute) => {
            return repos.task.save(taskAttribute);
        }));
    };
}

/**
 * 確定取引についてメールを送信する
 * @deprecated どこかのバージョンで廃止予定
 * @param transactionId 取引ID
 * @param emailMessageAttributes Eメールメッセージ属性
 */
export function sendEmail(
    transactionId: string,
    emailMessageAttributes: factory.creativeWork.message.email.IAttributes
): ITaskAndTransactionOperation<factory.task.sendEmailMessage.ITask> {
    return async (repos: {
        task: TaskRepo;
        transaction: TransactionRepo;
    }) => {
        const transaction = await repos.transaction.findById(factory.transactionType.PlaceOrder, transactionId);
        if (transaction.status !== factory.transactionStatusType.Confirmed) {
            throw new factory.errors.Forbidden('Transaction not confirmed.');
        }
        const transactionResult = transaction.result;
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore next */
        if (transactionResult === undefined) {
            throw new factory.errors.NotFound('transaction.result');
        }

        const emailMessage: factory.creativeWork.message.email.ICreativeWork = {
            typeOf: factory.creativeWorkType.EmailMessage,
            identifier: `placeOrderTransaction-${transactionId}`,
            name: `placeOrderTransaction-${transactionId}`,
            sender: {
                typeOf: transaction.seller.typeOf,
                name: emailMessageAttributes.sender.name,
                email: emailMessageAttributes.sender.email
            },
            toRecipient: {
                typeOf: transaction.agent.typeOf,
                name: emailMessageAttributes.toRecipient.name,
                email: emailMessageAttributes.toRecipient.email
            },
            about: emailMessageAttributes.about,
            text: emailMessageAttributes.text
        };
        const actionAttributes: factory.action.transfer.send.message.email.IAttributes = {
            typeOf: factory.actionType.SendAction,
            object: emailMessage,
            agent: transaction.seller,
            recipient: transaction.agent,
            potentialActions: {},
            purpose: transactionResult.order
        };

        // その場で送信ではなく、DBにタスクを登録
        const sendEmailMessageTask: factory.task.sendEmailMessage.IAttributes = {
            name: factory.taskName.SendEmailMessage,
            status: factory.taskStatus.Ready,
            runsAt: new Date(), // なるはやで実行
            remainingNumberOfTries: 10,
            lastTriedAt: null,
            numberOfTried: 0,
            executionResults: [],
            data: {
                actionAttributes: actionAttributes
            }
        };

        return <factory.task.sendEmailMessage.ITask>await repos.task.save(sendEmailMessageTask);
    };
}
