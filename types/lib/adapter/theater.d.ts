/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import * as Theater from '../factory/theater';
import theaterModel from './mongoose/model/theater';
export default class TheaterAdapter {
    readonly connection: Connection;
    model: typeof theaterModel;
    constructor(connection: Connection);
    store(theater: Theater.ITheater): Promise<void>;
}
