/// <reference types="mongoose" />
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import * as Film from '../../factory/film';
import FilmAdapter from '../film';
export default class FilmAdapterInterpreter implements FilmAdapter {
    readonly connection: Connection;
    private model;
    constructor(connection: Connection);
    findById(id: string): Promise<monapt.Option<Film.IFilm>>;
    store(film: Film.IFilm): Promise<void>;
}
