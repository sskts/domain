/**
 * order service
 * @namespace service/order
 */

import * as factory from '@motionpicture/sskts-factory';

import { MongoRepository as OrderRepository } from '../repo/order';
import { MongoRepository as TransactionRepository } from '../repo/transaction';

export type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;

export function createFromTransaction(transactionId: string) {
    return async (orderRepository: OrderRepository, transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderById(transactionId);

        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (transaction.result !== undefined) {
            await orderRepository.save(transaction.result.order);
        }
    };
}
