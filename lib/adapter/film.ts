/**
 * 作品リポジトリ
 *
 * @class FilmAdapter
 */

import * as clone from 'clone';
import * as createDebug from 'debug';
import { Connection } from 'mongoose';
import * as Film from '../factory/film';
import filmModel from './mongoose/model/film';

const debug = createDebug('sskts-domain:adapter:film');

export default class FilmAdapter {
    public model: typeof filmModel;

    constructor(readonly connection: Connection) {
        this.model = this.connection.model(filmModel.modelName);
    }

    public async store(film: Film.IFilm) {
        debug('updating...', film);
        const update = clone(film, false);
        await this.model.findByIdAndUpdate(update.id, update, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
