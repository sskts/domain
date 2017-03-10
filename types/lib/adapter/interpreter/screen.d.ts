/// <reference types="mongoose" />
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import * as Screen from '../../factory/screen';
import ScreenAdapter from '../screen';
export default class ScreenAdapterInterpreter implements ScreenAdapter {
    readonly connection: Connection;
    private model;
    constructor(connection: Connection);
    findById(id: string): Promise<monapt.Option<Screen.IScreen>>;
    findByTheater(theaterId: string): Promise<Screen.IScreen[]>;
    store(screen: Screen.IScreen): Promise<void>;
}
