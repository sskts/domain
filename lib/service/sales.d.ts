import * as factory from '@motionpicture/sskts-factory';
export declare type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;
/**
 * GMOオーソリ取消
 *
 * @memberof service/sales
 */
export declare function cancelGMOAuth(transaction: IPlaceOrderTransaction): () => Promise<void>;
/**
 * GMO売上確定
 *
 * @memberof service/sales
 */
export declare function settleGMOAuth(transaction: IPlaceOrderTransaction): () => Promise<void>;
/**
 * ムビチケ着券取消し
 *
 * @memberof service/sales
 */
export declare function cancelMvtk(__: IPlaceOrderTransaction): () => Promise<void>;
/**
 * ムビチケ資産移動
 *
 * @memberof service/sales
 */
export declare function settleMvtk(__: IPlaceOrderTransaction): () => Promise<void>;
