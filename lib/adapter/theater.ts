import { Connection } from 'mongoose';
import theaterModel from './mongoose/model/theater';

/**
 * 劇場アダプター
 *
 * @class TheaterAdapter
 */
export default class TheaterAdapter {
    public readonly model: typeof theaterModel;

    constructor(connection: Connection) {
        this.model = connection.model(theaterModel.modelName);
    }
}
