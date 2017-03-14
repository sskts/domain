/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import * as Screen from '../factory/screen';
import screenModel from './mongoose/model/screen';
export default class ScreenAdapter {
    readonly connection: Connection;
    model: typeof screenModel;
    constructor(connection: Connection);
    store(screen: Screen.IScreen): Promise<void>;
}
