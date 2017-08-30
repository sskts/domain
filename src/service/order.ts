/**
 * order service
 * @namespace service/order
 */

import * as factory from '@motionpicture/sskts-factory';

import OrderAdapter from '../adapter/order';
import TransactionAdapter from '../adapter/transaction';

export type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;

export function createFromTransaction(transactionId: string) {
    return async (orderAdapter: OrderAdapter, transactionAdapter: TransactionAdapter) => {
        const transaction = await transactionAdapter.findPlaceOrderById(transactionId);
        if (transaction === null) {
            throw new factory.error.Argument('transactionId', `transaction[${transactionId}] not found.`);
        }

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
 * find an order by an inquiry key
 * @param {factory.order.IOrderInquiryKey} orderInquiryKey
 */
export function findByOrderInquiryKey(orderInquiryKey: factory.order.IOrderInquiryKey) {
    return async (orderAdapter: OrderAdapter) => {
        const doc = await orderAdapter.orderModel.findOne(
            {
                'orderInquiryKey.theaterCode': orderInquiryKey.theaterCode,
                'orderInquiryKey.confirmationNumber': orderInquiryKey.confirmationNumber,
                'orderInquiryKey.telephone': orderInquiryKey.telephone
            }
        ).exec();

        if (doc === null) {
            throw new factory.error.NotFound('order');
        }

        return <factory.order.IOrder>doc.toObject();
    };
}
