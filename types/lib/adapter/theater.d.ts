/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import theaterModel from './mongoose/model/theater';
/**
 * 劇場アダプター
 *
 * @class TheaterAdapter
 */
export default class TheaterAdapter {
    readonly model: typeof theaterModel;
    constructor(connection: Connection);
}
