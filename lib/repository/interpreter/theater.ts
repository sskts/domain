/**
 * 劇場リポジトリ
 *
 * @class TheaterRepositoryInterpreter
 */

import * as createDebug from 'debug';
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import Theater from '../../model/theater';
import TheaterRepository from '../theater';
import theaterModel from './mongoose/model/theater';

const debug = createDebug('sskts-domain:repository:theater');

export default class TheaterRepositoryInterpreter implements TheaterRepository {
    private model: typeof theaterModel;

    constructor(readonly connection: Connection) {
        this.model = this.connection.model(theaterModel.modelName);
    }

    public async findById(id: string) {
        debug('finding theater...', id);
        const doc = await this.model.findById(id).exec();
        debug('theater found.', doc);

        return (doc) ? monapt.Option(Theater.create(<any>doc.toObject())) : monapt.None;
    }

    public async store(theater: Theater) {
        debug('updating a theater...', theater);
        await this.model.findByIdAndUpdate(theater.id, theater, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
