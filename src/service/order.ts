/**
 * order service
 * @namespace service/order
 */

import * as factory from '@motionpicture/sskts-factory';
import * as monapt from 'monapt';

import ArgumentError from '../error/argument';

import OrderAdapter from '../adapter/order';
import TransactionAdapter from '../adapter/transaction';

export type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;

export function createFromTransaction(transactionId: string) {
    return async (orderAdapter: OrderAdapter, transactionAdapter: TransactionAdapter) => {
        const transaction = await transactionAdapter.findPlaceOrderById(transactionId);
        if (transaction === null) {
            throw new ArgumentError('transactionId', `transaction[${transactionId}] not found.`);
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
        return await orderAdapter.orderModel.findOne(
            {
                'orderInquiryKey.theaterCode': orderInquiryKey.theaterCode,
                'orderInquiryKey.confirmationNumber': orderInquiryKey.confirmationNumber,
                'orderInquiryKey.telephone': orderInquiryKey.telephone
            }
        ).exec()
            .then((doc) => (doc === null) ? monapt.None : monapt.Option(<factory.order.IOrder>doc.toObject()));
    };
}
