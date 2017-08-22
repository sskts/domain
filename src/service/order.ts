/**
 * 注文サービス
 *
 * @namespace service/order
 */

import * as factory from '@motionpicture/sskts-factory';
import * as monapt from 'monapt';

import OrderAdapter from '../adapter/order';

export type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;

export function createFromTransaction(transaction: IPlaceOrderTransaction) {
    return async (orderAdapter: OrderAdapter) => {
        if (transaction.result !== undefined) {
            const order = transaction.result.order;

            await orderAdapter.orderModel.findOneAndUpdate(
                {
                    orderNumber: order.orderNumber
                },
                order,
                { upsert: true }
            ).exec();
        }
    };
}

/**
 * 注文内容を照会する
 */
export function findByOrderInquiryKey(orderInquiryKey: factory.orderInquiryKey.IOrderInquiryKey) {
    return async (orderAdapter: OrderAdapter) => {
        return await orderAdapter.orderModel.findOne(
            {
                'orderInquiryKey.theaterCode': orderInquiryKey.theaterCode,
                'orderInquiryKey.orderNumber': orderInquiryKey.orderNumber,
                'orderInquiryKey.telephone': orderInquiryKey.telephone
            }
        ).exec()
            .then((doc) => (doc === null) ? monapt.None : monapt.Option(<factory.order.IOrder>doc.toObject()));
    };
}
