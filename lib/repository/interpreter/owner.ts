/**
 * 所有者リポジトリ
 *
 * @class OwnerRepositoryInterpreter
 */

import * as monapt from 'monapt';
import { Connection } from 'mongoose';

import ObjectId from '../../model/objectId';
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

    public async findById(id: ObjectId) {
        const model = this.connection.model(ownerModel.modelName);
        const owner = <Owner>await model.findOne({ _id: id }).lean().exec();

        return (owner) ? monapt.Option(owner) : monapt.None;
    }

    public async findPromoter() {
        const model = this.connection.model(ownerModel.modelName);
        const owner = <Owner.PromoterOwner>await model.findOne({ group: OwnerGroup.PROMOTER }).lean().exec();

        return (owner) ? monapt.Option(owner) : monapt.None;
    }

    public async findOneAndUpdate(conditions: Object, update: Object) {
        const model = this.connection.model(ownerModel.modelName);
        const owner = <Owner>await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        }).lean().exec();

        return (owner) ? monapt.Option(owner) : monapt.None;
    }

    public async store(owner: Owner) {
        const model = this.connection.model(ownerModel.modelName);
        await model.findOneAndUpdate({ _id: owner._id }, owner, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
