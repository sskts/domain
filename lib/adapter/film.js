"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const film_1 = require("./mongoose/model/film");
/**
 * 作品アダプター
 *
 * @export
 * @class FilmAdapter
 */
class FilmAdapter {
    constructor(connection) {
        this.model = connection.model(film_1.default.modelName);
    }
}
exports.default = FilmAdapter;
