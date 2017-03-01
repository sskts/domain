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
    private model: typeof filmModel;

    constructor(readonly connection: Connection) {
        this.model = this.connection.model(filmModel.modelName);
    }

    public async findById(id: string) {
        const doc = await this.model.findById(id).exec();

        return (doc) ? monapt.Option(Film.create(<any>doc.toObject())) : monapt.None;
    }

    public async store(film: Film) {
        debug('updating a film...', film);
        await this.model.findByIdAndUpdate(film.id, film.toDocument(), {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
