/// <reference types="mongoose" />
/**
 * 作品アダプター
 *
 * @class FilmAdapter
 */
import { Connection } from 'mongoose';
import filmModel from './mongoose/model/film';
export default class FilmAdapter {
    readonly connection: Connection;
    model: typeof filmModel;
    constructor(connection: Connection);
}
