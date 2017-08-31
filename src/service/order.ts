/**
 * order service
 * @namespace service/order
 */

import * as factory from '@motionpicture/sskts-factory';

import OrderRepository from '../repo/order';
import TransactionRepository from '../repo/transaction';

export type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;

export function createFromTransaction(transactionId: string) {
    return async (orderRepository: OrderRepository, transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderById(transactionId);
        if (transaction === null) {
            throw new factory.errors.Argument('transactionId', `transaction[${transactionId}] not found.`);
        }

        if (transaction.result !== undefined) {
            const order = transaction.result.order;
            await orderRepository.orderModel.findOneAndUpdate(
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
    return async (orderRepository: OrderRepository) => {
        const doc = await orderRepository.orderModel.findOne(
            {
                'orderInquiryKey.theaterCode': orderInquiryKey.theaterCode,
                'orderInquiryKey.confirmationNumber': orderInquiryKey.confirmationNumber,
                'orderInquiryKey.telephone': orderInquiryKey.telephone
            }
        ).exec();

        if (doc === null) {
            throw new factory.errors.NotFound('order');
        }

        return <factory.order.IOrder>doc.toObject();
    };
}
