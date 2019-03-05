import * as mongoose from 'mongoose';

import creativeWorkModel from './mongoose/model/creativeWork';

import * as factory from '../factory';

/**
 * 作品抽象リポジトリ
 */
export abstract class Repository {
    public abstract async saveMovie(movie: factory.chevre.creativeWork.movie.ICreativeWork): Promise<void>;
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
     * 映画作品を保管する
     */
    public async saveMovie(movie: factory.chevre.creativeWork.movie.ICreativeWork) {
        await this.creativeWorkModel.findOneAndUpdate(
            {
                typeOf: factory.creativeWorkType.Movie,
                identifier: {
                    $exists: true,
                    $eq: movie.identifier
                }
            },
            movie,
            { upsert: true }
        ).exec();
    }
}
