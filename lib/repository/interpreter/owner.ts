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
    private model: typeof ownerModel;

    constructor(readonly connection: Connection) {
        this.model = this.connection.model(ownerModel.modelName);
    }

    public async find(conditions: any) {
        return <Owner[]>await this.model.find({ $and: [conditions] }).lean().exec();
    }

    public async findById(id: string) {
        const doc = await this.model.findById(id).exec();

        return (doc) ? monapt.Option(<Owner>doc.toObject()) : monapt.None;
    }

    public async findPromoter() {
        const doc = await this.model.findOne({ group: OwnerGroup.PROMOTER }).exec();

        return (doc) ? monapt.Option(Owner.createPromoter(<any>doc.toObject())) : monapt.None;
    }

    public async findOneAndUpdate(conditions: any, update: any) {
        const doc = await this.model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        }).exec();

        return (doc) ? monapt.Option(<Owner>doc.toObject()) : monapt.None;
    }

    public async store(owner: Owner) {
        await this.model.findByIdAndUpdate(owner.id, owner, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
