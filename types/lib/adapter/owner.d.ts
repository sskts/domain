/// <reference types="mongoose" />
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import * as Owner from '../factory/owner';
import ownerModel from './mongoose/model/owner';
export default class OwnerAdapter {
    readonly connection: Connection;
    model: typeof ownerModel;
    constructor(connection: Connection);
    findById(id: string): Promise<monapt.Option<Owner.IOwner>>;
    findPromoter(): Promise<monapt.Option<Owner.IPromoterOwner>>;
    findOneAndUpdate(conditions: any, update: any): Promise<monapt.Option<Owner.IOwner>>;
    store(owner: Owner.IOwner): Promise<void>;
}
