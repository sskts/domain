/**
 * 劇場リポジトリ
 *
 * @class TheaterAdapter
 */

import * as clone from 'clone';
import * as createDebug from 'debug';
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import * as Theater from '../factory/theater';

import theaterModel from './mongoose/model/theater';

const debug = createDebug('sskts-domain:adapter:theater');

export default class TheaterAdapter {
    public model: typeof theaterModel;

    constructor(readonly connection: Connection) {
        this.model = this.connection.model(theaterModel.modelName);
    }

    public async findById(id: string) {
        debug('finding theater...', id);
        const doc = await this.model.findById(id).exec();
        debug('theater found.', doc);

        return (doc) ? monapt.Option(<Theater.ITheater>doc.toObject()) : monapt.None;
    }

    public async store(theater: Theater.ITheater) {
        debug('updating...', theater);
        const update = clone(theater);
        await this.model.findByIdAndUpdate(update.id, update, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
