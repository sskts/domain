/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import filmModel from './mongoose/model/film';
/**
 * 作品アダプター
 *
 * @export
 * @class FilmAdapter
 */
export default class FilmAdapter {
    model: typeof filmModel;
    private readonly connection;
    constructor(connection: Connection);
}
