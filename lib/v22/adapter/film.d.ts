/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import filmModel from './mongoose/model/film';
/**
 * 作品レポジトリー
 *
 * @class FilmAdapter
 */
export default class FilmAdapter {
    readonly model: typeof filmModel;
    constructor(connection: Connection);
}
