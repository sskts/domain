import * as factory from '@motionpicture/sskts-factory';
import TransactionRepository from '../repository/transaction';
export declare type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;
/**
 * GMOオーソリ取消
 *
 * @memberof service/sales
 */
export declare function cancelGMOAuth(transactionId: string): (transactionRepository: TransactionRepository) => Promise<void>;
/**
 * GMO売上確定
 *
 * @memberof service/sales
 */
export declare function settleGMOAuth(transactionId: string): (transactionRepository: TransactionRepository) => Promise<void>;
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
