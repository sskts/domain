import { Connection } from 'mongoose';
import filmModel from './mongoose/model/film';

/**
 * 作品アダプター
 *
 * @export
 * @class FilmAdapter
 */
export default class FilmAdapter {
    public model: typeof filmModel;
    private readonly connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
        this.model = this.connection.model(filmModel.modelName);
    }
}
