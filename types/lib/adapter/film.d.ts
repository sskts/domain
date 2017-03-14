/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import * as Film from '../factory/film';
import filmModel from './mongoose/model/film';
export default class FilmAdapter {
    readonly connection: Connection;
    model: typeof filmModel;
    constructor(connection: Connection);
    store(film: Film.IFilm): Promise<void>;
}
