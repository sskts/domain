/**
 * 作品アダプター
 *
 * @class FilmAdapter
 */
import { Connection } from 'mongoose';
import filmModel from './mongoose/model/film';

export default class FilmAdapter {
    public model: typeof filmModel;

    constructor(readonly connection: Connection) {
        this.model = this.connection.model(filmModel.modelName);
    }
}
