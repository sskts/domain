/**
 * ownershipInfo service
 * @namespace service.ownershipInfo
 */

import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';

import { MongoRepository as ActionRepo } from '../repo/action';
import { MongoRepository as OwnershipInfoRepo } from '../repo/ownershipInfo';
import { MongoRepository as TransactionRepo } from '../repo/transaction';

const debug = createDebug('sskts-domain:service:ownershipInfo');

export type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;

/**
 * 注文取引結果から所有権を作成する
 * @export
 * @function
 * @memberof service.ownershipInfo
 */
export function createFromTransaction(transactionId: string) {
    return async (actionRepo: ActionRepo, ownershipInfoRepository: OwnershipInfoRepo, transactionRepository: TransactionRepo) => {
        const transaction = await transactionRepository.findPlaceOrderById(transactionId);

        if (transaction.result !== undefined) {
            // アクション開始
            const actionObject: factory.action.transfer.send.order.IObject = transaction.result.order;
            const action = await actionRepo.start<factory.action.transfer.send.order.IAction>(
                factory.actionType.SendAction,
                transaction.seller,
                transaction.agent,
                actionObject
            );

            try {
                await Promise.all(transaction.result.ownershipInfos.map(async (ownershipInfo) => {
                    await ownershipInfoRepository.save(ownershipInfo);
                }));
            } catch (error) {
                // actionにエラー結果を追加
                try {
                    const actionError = (error instanceof Error) ? { ...error, ...{ message: error.message } } : error;
                    await actionRepo.giveUp(factory.actionType.SendAction, action.id, actionError);
                } catch (__) {
                    // 失敗したら仕方ない
                }

                throw new Error(error);
            }

            // アクション完了
            debug('ending action...');
            await actionRepo.complete(factory.actionType.SendAction, action.id, {});
        }
    };
}
