/**
 * 所有者リポジトリ
 *
 * @class OwnerAdapter
 */

import * as clone from 'clone';
import { Connection } from 'mongoose';

import * as Owner from '../factory/owner';

import ownerModel from './mongoose/model/owner';

export default class OwnerAdapter {
    public model: typeof ownerModel;

    constructor(readonly connection: Connection) {
        this.model = this.connection.model(ownerModel.modelName);
    }

    public async store(owner: Owner.IOwner) {
        const update = clone(owner, false);
        await this.model.findByIdAndUpdate(update.id, update, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
