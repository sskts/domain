/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import theaterModel from './mongoose/model/theater';
/**
 * 劇場アダプター
 *
 * @export
 * @class TheaterAdapter
 */
export default class TheaterAdapter {
    model: typeof theaterModel;
    private readonly connection;
    constructor(connection: Connection);
}
