/// <reference types="mongoose" />
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import Theater from '../../model/theater';
import TheaterRepository from '../theater';
export default class TheaterRepositoryInterpreter implements TheaterRepository {
    readonly connection: Connection;
    constructor(connection: Connection);
    findById(id: string): Promise<monapt.Option<Theater>>;
    store(theater: Theater): Promise<void>;
}
