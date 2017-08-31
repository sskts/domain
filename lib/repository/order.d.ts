/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import OrderModel from './mongoose/model/order';
/**
 * 注文レポジトリー
 *
 * @class OrderRepository
 */
export default class OrderRepository {
    readonly orderModel: typeof OrderModel;
    constructor(connection: Connection);
}
