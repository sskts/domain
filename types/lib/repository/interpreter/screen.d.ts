/// <reference types="mongoose" />
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import Screen from '../../model/screen';
import ScreenRepository from '../screen';
export default class ScreenRepositoryInterpreter implements ScreenRepository {
    readonly connection: Connection;
    private model;
    constructor(connection: Connection);
    findById(id: string): Promise<monapt.Option<Screen>>;
    findByTheater(theaterId: string): Promise<Screen[]>;
    store(screen: Screen): Promise<void>;
}
