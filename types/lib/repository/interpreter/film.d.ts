/// <reference types="mongoose" />
import * as mongoose from "mongoose";
import * as monapt from "monapt";
import Film from "../../model/film";
import FilmRepository from "../film";
export default class FilmRepositoryInterpreter implements FilmRepository {
    readonly connection: mongoose.Connection;
    constructor(connection: mongoose.Connection);
    findById(id: string): Promise<monapt.Option<Film>>;
    store(film: Film): Promise<void>;
}
