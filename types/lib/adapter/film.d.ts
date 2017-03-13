/// <reference types="mongoose" />
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import * as Film from '../factory/film';
import filmModel from './mongoose/model/film';
export default class FilmAdapter {
    readonly connection: Connection;
    model: typeof filmModel;
    constructor(connection: Connection);
    findById(id: string): Promise<monapt.Option<Film.IFilm>>;
    store(film: Film.IFilm): Promise<void>;
}
