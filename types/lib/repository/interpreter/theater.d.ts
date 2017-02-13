/// <reference types="mongoose" />
/**
 * 劇場リポジトリ
 *
 * @class TheaterRepositoryInterpreter
 */
import * as monapt from 'monapt';
import * as mongoose from 'mongoose';
import Theater from '../../model/theater';
import TheaterRepository from '../theater';
export default class TheaterRepositoryInterpreter implements TheaterRepository {
    readonly connection: mongoose.Connection;
    constructor(connection: mongoose.Connection);
    findById(id: string): Promise<monapt.Option<Theater>>;
    store(theater: Theater): Promise<void>;
}
