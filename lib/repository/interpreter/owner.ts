/**
 * 所有者リポジトリ
 *
 * @class OwnerRepositoryInterpreter
 */

import * as monapt from 'monapt';
import { Connection } from 'mongoose';

import Owner from '../../model/owner';
import OwnerGroup from '../../model/ownerGroup';

import OwnerRepository from '../owner';
import ownerModel from './mongoose/model/owner';

export default class OwnerRepositoryInterpreter implements OwnerRepository {
    constructor(readonly connection: Connection) {
    }

    public async find(conditions: Object) {
        const model = this.connection.model(ownerModel.modelName);
        return <Owner[]>await model.find({ $and: [conditions] }).lean().exec();
    }

    public async findById(id: string) {
        const model = this.connection.model(ownerModel.modelName);
        const doc = await model.findById(id).exec();

        return (doc) ? monapt.Option(<Owner>doc.toObject()) : monapt.None;
    }

    public async findPromoter() {
        const model = this.connection.model(ownerModel.modelName);
        const doc = await model.findOne({ group: OwnerGroup.PROMOTER }).exec();

        return (doc) ? monapt.Option(Owner.createPromoter(<any>doc.toObject())) : monapt.None;
    }

    public async findOneAndUpdate(conditions: Object, update: Object) {
        const model = this.connection.model(ownerModel.modelName);
        const doc = await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        }).exec();

        return (doc) ? monapt.Option(<Owner>doc.toObject()) : monapt.None;
    }

    public async store(owner: Owner) {
        const model = this.connection.model(ownerModel.modelName);
        await model.findByIdAndUpdate(owner.id, owner, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
