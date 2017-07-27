/**
 * 注文サービス
 *
 * @namespace service/order
 */

import * as monapt from 'monapt';

import OrderAdapter from '../adapter/order';
import * as OrderFactory from '../factory/order';
import * as OrderInquiryKeyFactory from '../factory/orderInquiryKey';
import * as PlaceOrderTransactionFactory from '../factory/transaction/placeOrder';

export type IPlaceOrderTransaction = PlaceOrderTransactionFactory.ITransaction;

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
export function findByOrderInquiryKey(orderInquiryKey: OrderInquiryKeyFactory.IOrderInquiryKey) {
    return async (orderAdapter: OrderAdapter) => {
        return await orderAdapter.orderModel.findOne(
            {
                'orderInquiryKey.theaterCode': orderInquiryKey.theaterCode,
                'orderInquiryKey.orderNumber': orderInquiryKey.orderNumber,
                'orderInquiryKey.telephone': orderInquiryKey.telephone
            }
        ).exec()
            .then((doc) => (doc === null) ? monapt.None : monapt.Option(<OrderFactory.IOrder>doc.toObject()));
    };
}
