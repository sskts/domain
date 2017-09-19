/**
 * ownershipInfo service
 * @namespace service.ownershipInfo
 */
import * as factory from '@motionpicture/sskts-factory';
import { MongoRepository as OwnershipInfoRepository } from '../repo/ownershipInfo';
import { MongoRepository as TransactionRepository } from '../repo/transaction';
export declare type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;
/**
 * 注文取引結果から所有権を作成する
 * @export
 * @function
 * @memberof service.ownershipInfo
 */
export declare function createFromTransaction(transactionId: string): (ownershipInfoRepository: OwnershipInfoRepository, transactionRepository: TransactionRepository) => Promise<void>;
