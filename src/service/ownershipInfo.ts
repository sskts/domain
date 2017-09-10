/**
 * ownershipInfo service
 * @namespace service.ownershipInfo
 */

import * as factory from '@motionpicture/sskts-factory';

import { MongoRepository as OwnershipInfoRepository } from '../repo/ownershipInfo';
import { MongoRepository as TransactionRepository } from '../repo/transaction';

export type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;

/**
 * 注文取引結果から所有権を作成する
 * @export
 * @function
 * @memberof service.ownershipInfo
 */
export function createFromTransaction(transactionId: string) {
    return async (ownershipInfoRepository: OwnershipInfoRepository, transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderById(transactionId);

        if (transaction.result !== undefined) {
            await Promise.all(transaction.result.ownershipInfos.map(async (ownershipInfo) => {
                await ownershipInfoRepository.save(ownershipInfo);
            }));
        }
    };
}
