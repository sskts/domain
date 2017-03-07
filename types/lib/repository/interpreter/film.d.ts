/// <reference types="mongoose" />
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import * as Film from '../../model/film';
import FilmRepository from '../film';
export default class FilmRepositoryInterpreter implements FilmRepository {
    readonly connection: Connection;
    private model;
    constructor(connection: Connection);
    findById(id: string): Promise<monapt.Option<Film.IFilm>>;
    store(film: Film.IFilm): Promise<void>;
}
