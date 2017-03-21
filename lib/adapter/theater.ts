import { Connection } from 'mongoose';
import theaterModel from './mongoose/model/theater';

/**
 * 劇場アダプター
 *
 * @export
 * @class TheaterAdapter
 */
export default class TheaterAdapter {
    public model: typeof theaterModel;
    private readonly connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
        this.model = this.connection.model(theaterModel.modelName);
    }
}
