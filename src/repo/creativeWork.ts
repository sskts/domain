import { mongoose } from '@cinerino/domain';

import creativeWorkModel from './mongoose/model/creativeWork';

import * as factory from '../factory';

/**
 * 作品抽象リポジトリ
 */
export abstract class Repository {
    public abstract async saveMovie(movie: factory.creativeWork.movie.ICreativeWork): Promise<void>;
}

/**
 * 作品リポジトリ
 */
export class MongoRepository implements Repository {
    public readonly creativeWorkModel: typeof creativeWorkModel;

    constructor(connection: mongoose.Connection) {
        this.creativeWorkModel = connection.model(creativeWorkModel.modelName);
    }

    /**
     * save a movie
     * 映画作品を保管する
     * @param movie movie object
     */
    public async saveMovie(movie: factory.creativeWork.movie.ICreativeWork) {
        await this.creativeWorkModel.findOneAndUpdate(
            {
                identifier: movie.identifier,
                typeOf: factory.creativeWorkType.Movie
            },
            movie,
            { upsert: true }
        ).exec();
    }
}
