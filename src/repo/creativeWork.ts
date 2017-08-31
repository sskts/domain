import { Connection } from 'mongoose';
import creativeWorkModel from './mongoose/model/creativeWork';

/**
 * 作品レポジトリー
 *
 * @class CreativeWorkRepository
 */
export default class CreativeWorkRepository {
    public readonly creativeWorkModel: typeof creativeWorkModel;

    constructor(connection: Connection) {
        this.creativeWorkModel = connection.model(creativeWorkModel.modelName);
    }
}
