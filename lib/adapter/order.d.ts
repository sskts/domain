/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import OrderModel from './mongoose/model/order';
/**
 * 注文アダプター
 *
 * @class OrderAdapter
 */
export default class OrderAdapter {
    readonly orderModel: typeof OrderModel;
    constructor(connection: Connection);
}
