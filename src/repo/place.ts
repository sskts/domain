import { Connection } from 'mongoose';
import placeModel from './mongoose/model/place';

/**
 * 場所レポジトリー
 *
 * @class PlaceRepository
 */
export default class PlaceRepository {
    public readonly placeModel: typeof placeModel;

    constructor(connection: Connection) {
        this.placeModel = connection.model(placeModel.modelName);
    }
}
