/// <reference types="mongoose" />
import mongoose = require("mongoose");
import monapt = require("monapt");
import Film from "../../model/film";
import FilmRepository from "../film";
export default class FilmRepositoryInterpreter implements FilmRepository {
    readonly connection: mongoose.Connection;
    constructor(connection: mongoose.Connection);
    findById(id: string): Promise<monapt.Option<Film>>;
    store(film: Film): Promise<void>;
}
