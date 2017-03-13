/// <reference types="mongoose" />
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import * as Screen from '../factory/screen';
import screenModel from './mongoose/model/screen';
export default class ScreenAdapter {
    readonly connection: Connection;
    model: typeof screenModel;
    constructor(connection: Connection);
    findById(id: string): Promise<monapt.Option<Screen.IScreen>>;
    findByTheater(theaterId: string): Promise<Screen.IScreen[]>;
    store(screen: Screen.IScreen): Promise<void>;
}
