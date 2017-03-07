/// <reference types="mongoose" />
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import * as Owner from '../../model/owner';
import OwnerRepository from '../owner';
export default class OwnerRepositoryInterpreter implements OwnerRepository {
    readonly connection: Connection;
    private model;
    constructor(connection: Connection);
    findById(id: string): Promise<monapt.Option<Owner.IOwner>>;
    findPromoter(): Promise<monapt.Option<Owner.IPromoterOwner>>;
    findOneAndUpdate(conditions: any, update: any): Promise<monapt.Option<Owner.IOwner>>;
    store(owner: Owner.IOwner): Promise<void>;
}
