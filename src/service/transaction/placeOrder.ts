/**
 * 注文取引サービス
 */
import * as cinerino from '@cinerino/domain';

import { MongoRepository as TaskRepo } from '../../repo/task';
import { MongoRepository as TransactionRepo } from '../../repo/transaction';

import * as factory from '../../factory';

export type ITaskAndTransactionOperation<T> = (repos: {
    task: TaskRepo;
    transaction: TransactionRepo;
}) => Promise<T>;

/**
 * ひとつの取引のタスクをエクスポートする
 */
export import exportTasks = cinerino.service.transaction.placeOrder.exportTasks;

/**
 * 確定取引についてメールを送信する
 * @deprecated どこかのバージョンで廃止予定
 */
export function sendEmail(
    transactionId: string,
    emailMessageAttributes: factory.creativeWork.message.email.IAttributes
): ITaskAndTransactionOperation<factory.task.ITask<factory.taskName.SendEmailMessage>> {
    return async (repos: {
        task: TaskRepo;
        transaction: TransactionRepo;
    }) => {
        const transaction = await repos.transaction.findById({
            typeOf: factory.transactionType.PlaceOrder,
            id: transactionId
        });
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
        const sendEmailMessageTask: factory.task.IAttributes<factory.taskName.SendEmailMessage> = {
            name: factory.taskName.SendEmailMessage,
            status: factory.taskStatus.Ready,
            runsAt: new Date(), // なるはやで実行
            remainingNumberOfTries: 10,
            numberOfTried: 0,
            executionResults: [],
            data: {
                actionAttributes: actionAttributes
            }
        };

        return <factory.task.ITask<factory.taskName.SendEmailMessage>>await repos.task.save(sendEmailMessageTask);
    };
}
