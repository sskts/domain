/// <reference types="mongoose" />
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import * as Theater from '../../model/theater';
import TheaterRepository from '../theater';
export default class TheaterRepositoryInterpreter implements TheaterRepository {
    readonly connection: Connection;
    private model;
    constructor(connection: Connection);
    findById(id: string): Promise<monapt.Option<Theater.ITheater>>;
    store(theater: Theater.ITheater): Promise<void>;
}
