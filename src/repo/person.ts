import { Connection } from 'mongoose';
import personModel from './mongoose/model/person';

/**
 * 人物レポジトリー
 *
 * @class PersonRepository
 */
export default class PersonRepository {
    public readonly personModel: typeof personModel;

    constructor(connection: Connection) {
        this.personModel = connection.model(personModel.modelName);
    }
}
