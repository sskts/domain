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
    constructor(readonly connection: Connection) {
    }

    public async findById(id: string) {
        const model = this.connection.model(theaterModel.modelName);
        debug('finding theater...', id);
        const theater = <Theater>await model.findOne({ _id: id }).lean().exec();
        debug('theater found.', theater);

        return (theater) ? monapt.Option(theater) : monapt.None;
    }

    public async store(theater: Theater) {
        const model = this.connection.model(theaterModel.modelName);
        debug('waiting findOneAndUpdate...', theater);
        await model.findOneAndUpdate({ _id: theater._id }, theater, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
