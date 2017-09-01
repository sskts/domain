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

        if (transaction.result !== undefined) {
            await orderRepository.save(transaction.result.order);
        }
    };
}
