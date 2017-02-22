/// <reference types="mongoose" />
/**
 * 作品リポジトリ
 *
 * @class FilmRepositoryInterpreter
 */
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import Film from '../../model/film';
import FilmRepository from '../film';
export default class FilmRepositoryInterpreter implements FilmRepository {
    readonly connection: Connection;
    constructor(connection: Connection);
    findById(id: string): Promise<monapt.Option<Film>>;
    store(film: Film): Promise<void>;
}
