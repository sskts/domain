/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import theaterModel from './mongoose/model/theater';
/**
 * 劇場レポジトリー
 *
 * @class TheaterAdapter
 */
export default class TheaterAdapter {
    readonly model: typeof theaterModel;
    constructor(connection: Connection);
}
