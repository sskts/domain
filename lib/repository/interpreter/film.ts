/**
 * 作品リポジトリ
 *
 * @class FilmRepositoryInterpreter
 */

import * as createDebug from 'debug';
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import Film from '../../model/film';
import FilmRepository from '../film';
import filmModel from './mongoose/model/film';

const debug = createDebug('sskts-domain:repository:film');

export default class FilmRepositoryInterpreter implements FilmRepository {
    constructor(readonly connection: Connection) {
    }

    public async findById(id: string) {
        const model = this.connection.model(filmModel.modelName);
        const doc = await model.findOne({ _id: id }).exec();

        return (doc) ? monapt.Option(Film.create(<any>doc.toObject())) : monapt.None;
    }

    public async store(film: Film) {
        const model = this.connection.model(filmModel.modelName);
        debug('updating a film...', film);
        await model.findOneAndUpdate({ _id: film.id }, film.toDocument(), {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
