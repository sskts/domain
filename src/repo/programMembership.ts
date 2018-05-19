import * as factory from '@motionpicture/sskts-factory';
import { Connection } from 'mongoose';
import programMembershipModel from './mongoose/model/programMembership';

/**
 * 会員プログラムリポジトリー
 */
export class MongoRepository {
    public readonly programMembershipModel: typeof programMembershipModel;

    constructor(connection: Connection) {
        this.programMembershipModel = connection.model(programMembershipModel.modelName);
    }

    /**
     * 検索する
     */
    public async search(
        _: any
    ): Promise<factory.programMembership.IProgramMembership[]> {
        const andConditions: any[] = [
            { typeOf: <factory.programMembership.ProgramMembershipType>'programMembership' }
        ];

        return this.programMembershipModel.find({ $and: andConditions })
            .sort({ programName: 1 })
            .exec()
            .then((docs) => docs.map((doc) => doc.toObject()));
    }
}
