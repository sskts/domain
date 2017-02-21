/**
 * 作品リポジトリ
 *
 * @class FilmRepositoryInterpreter
 */

import * as monapt from 'monapt';
import * as mongoose from 'mongoose';
import Film from '../../model/film';
import FilmRepository from '../film';
import FilmModel from './mongoose/model/film';

export default class FilmRepositoryInterpreter implements FilmRepository {
    constructor(readonly connection: mongoose.Connection) {
    }

    public async findById(id: string) {
        const model = this.connection.model(FilmModel.modelName, FilmModel.schema);
        const doc = <any>await model.findOne({ _id: id }).lean().exec();

        return (doc) ? monapt.Option(Film.create(doc)) : monapt.None;
    }

    public async store(film: Film) {
        const model = this.connection.model(FilmModel.modelName, FilmModel.schema);
        await model.findOneAndUpdate({ _id: film._id }, film, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
