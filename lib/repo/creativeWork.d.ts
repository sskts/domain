/// <reference types="mongoose" />
import * as factory from '@motionpicture/sskts-factory';
import { Connection } from 'mongoose';
import creativeWorkModel from './mongoose/model/creativeWork';
export declare abstract class Repository {
    abstract saveMovie(movie: factory.creativeWork.movie.ICreativeWork): Promise<void>;
}
/**
 * 作品レポジトリー
 * @class CreativeWorkRepository
 */
export declare class MongoRepository implements Repository {
    readonly creativeWorkModel: typeof creativeWorkModel;
    constructor(connection: Connection);
    /**
     * save a movie
     * 映画作品を保管する
     * @param movie movie object
     */
    saveMovie(movie: factory.creativeWork.movie.ICreativeWork): Promise<void>;
}
