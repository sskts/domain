import * as factory from '@motionpicture/sskts-factory';
import { Connection } from 'mongoose';
import creativeWorkModel from './mongoose/model/creativeWork';

export abstract class Repository {
    public abstract async saveMovie(movie: factory.creativeWork.movie.ICreativeWork): Promise<void>;
}

export class StubRepository implements Repository {
    // tslint:disable-next-line:prefer-function-over-method
    public async saveMovie(__: factory.creativeWork.movie.ICreativeWork) {
        return;
    }
}

/**
 * 作品レポジトリー
 * @class CreativeWorkRepository
 */
export class MongoRepository implements Repository {
    public readonly creativeWorkModel: typeof creativeWorkModel;

    constructor(connection: Connection) {
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
