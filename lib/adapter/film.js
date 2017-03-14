"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const film_1 = require("./mongoose/model/film");
class FilmAdapter {
    constructor(connection) {
        this.connection = connection;
        this.model = this.connection.model(film_1.default.modelName);
    }
}
exports.default = FilmAdapter;
