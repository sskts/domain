/// <reference types="mongoose" />
import * as factory from '@motionpicture/sskts-factory';
import { Connection } from 'mongoose';
import OrderModel from './mongoose/model/order';
/**
 * 注文レポジトリー
 *
 * @class OrderRepository
 */
export declare class MongoRepository {
    readonly orderModel: typeof OrderModel;
    constructor(connection: Connection);
    /**
     * find an order by an inquiry key
     * @param {factory.order.IOrderInquiryKey} orderInquiryKey
     */
    findByOrderInquiryKey(orderInquiryKey: factory.order.IOrderInquiryKey): Promise<factory.order.IOrder>;
    save(order: factory.order.IOrder): Promise<void>;
}
