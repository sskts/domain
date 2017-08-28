import * as factory from '@motionpicture/sskts-factory';
import TransactionAdapter from '../adapter/transaction';
export declare type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;
/**
 * GMOオーソリ取消
 *
 * @memberof service/sales
 */
export declare function cancelGMOAuth(transactionId: string): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * GMO売上確定
 *
 * @memberof service/sales
 */
export declare function settleGMOAuth(transactionId: string): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * ムビチケ着券取消し
 *
 * @memberof service/sales
 */
export declare function cancelMvtk(__1: string): (__2: TransactionAdapter) => Promise<void>;
/**
 * ムビチケ資産移動
 *
 * @memberof service/sales
 */
export declare function settleMvtk(__1: string): (__2: TransactionAdapter) => Promise<void>;
