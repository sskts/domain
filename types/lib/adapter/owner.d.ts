/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import * as Owner from '../factory/owner';
import ownerModel from './mongoose/model/owner';
export default class OwnerAdapter {
    readonly connection: Connection;
    model: typeof ownerModel;
    constructor(connection: Connection);
    store(owner: Owner.IOwner): Promise<void>;
}
