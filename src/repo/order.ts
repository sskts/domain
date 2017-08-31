import { Connection } from 'mongoose';
import OrderModel from './mongoose/model/order';

/**
 * 注文レポジトリー
 *
 * @class OrderRepository
 */
export default class OrderRepository {
    public readonly orderModel: typeof OrderModel;

    constructor(connection: Connection) {
        this.orderModel = connection.model(OrderModel.modelName);
    }
}
