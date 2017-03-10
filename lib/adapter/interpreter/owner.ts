/**
 * 所有者リポジトリ
 *
 * @class OwnerAdapterInterpreter
 */

import * as clone from 'clone';
import * as monapt from 'monapt';
import { Connection } from 'mongoose';

import * as Owner from '../../factory/owner';
import OwnerGroup from '../../factory/ownerGroup';

import OwnerAdapter from '../owner';
import ownerModel from './mongoose/model/owner';

export default class OwnerAdapterInterpreter implements OwnerAdapter {
    private model: typeof ownerModel;

    constructor(readonly connection: Connection) {
        this.model = this.connection.model(ownerModel.modelName);
    }

    public async findById(id: string) {
        const doc = await this.model.findById(id).exec();

        return (doc) ? monapt.Option(<Owner.IOwner>doc.toObject()) : monapt.None;
    }

    public async findPromoter() {
        const doc = await this.model.findOne({ group: OwnerGroup.PROMOTER }).exec();

        return (doc) ? monapt.Option(<Owner.IPromoterOwner>doc.toObject()) : monapt.None;
    }

    public async findOneAndUpdate(conditions: any, update: any) {
        const doc = await this.model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        }).exec();

        return (doc) ? monapt.Option(<Owner.IOwner>doc.toObject()) : monapt.None;
    }

    public async store(owner: Owner.IOwner) {
        const update = clone(owner, false);
        await this.model.findByIdAndUpdate(update.id, update, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
