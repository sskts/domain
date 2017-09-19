/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import personModel from './mongoose/model/person';
/**
 * 人物レポジトリー
 *
 * @class PersonRepository
 */
export declare class MongoRepository {
    readonly personModel: typeof personModel;
    constructor(connection: Connection);
}
