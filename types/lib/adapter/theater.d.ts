/// <reference types="mongoose" />
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import * as Theater from '../factory/theater';
import theaterModel from './mongoose/model/theater';
export default class TheaterAdapter {
    readonly connection: Connection;
    model: typeof theaterModel;
    constructor(connection: Connection);
    findById(id: string): Promise<monapt.Option<Theater.ITheater>>;
    store(theater: Theater.ITheater): Promise<void>;
}
