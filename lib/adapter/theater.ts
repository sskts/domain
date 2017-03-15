/**
 * 劇場アダプター
 *
 * @class TheaterAdapter
 */
import { Connection } from 'mongoose';
import theaterModel from './mongoose/model/theater';

export default class TheaterAdapter {
    public model: typeof theaterModel;

    constructor(readonly connection: Connection) {
        this.model = this.connection.model(theaterModel.modelName);
    }
}
