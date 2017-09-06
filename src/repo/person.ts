import { Connection } from 'mongoose';
import personModel from './mongoose/model/person';

/**
 * 人物レポジトリー
 *
 * @class PersonRepository
 */
export class MongoRepository {
    public readonly personModel: typeof personModel;

    constructor(connection: Connection) {
        this.personModel = connection.model(personModel.modelName);
    }
}
