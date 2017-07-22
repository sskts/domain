import { Connection } from 'mongoose';
import placeModel from './mongoose/model/place';

/**
 * 場所アダプター
 *
 * @class PlaceAdapter
 */
export default class PlaceAdapter {
    public readonly placeModel: typeof placeModel;

    constructor(connection: Connection) {
        this.placeModel = connection.model(placeModel.modelName);
    }
}
