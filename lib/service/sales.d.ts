import * as factory from '@motionpicture/sskts-factory';
import TransactionRepository from '../repo/transaction';
export declare type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;
/**
 * クレジットカードオーソリ取消
 * @memberof service/sales
 */
export declare function cancelCreditCardAuth(transactionId: string): (transactionRepository: TransactionRepository) => Promise<void>;
/**
 * クレジットカード売上確定
 * @memberof service/sales
 */
export declare function settleCreditCardAuth(transactionId: string): (transactionRepository: TransactionRepository) => Promise<void>;
/**
 * ムビチケ着券取消し
 *
 * @memberof service/sales
 */
export declare function cancelMvtk(__1: string): (__2: TransactionRepository) => Promise<void>;
/**
 * ムビチケ資産移動
 *
 * @memberof service/sales
 */
export declare function settleMvtk(__1: string): (__2: TransactionRepository) => Promise<void>;
