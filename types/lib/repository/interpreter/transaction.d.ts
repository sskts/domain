/// <reference types="mongoose" />
import mongoose = require("mongoose");
import monapt = require("monapt");
import ObjectId from "../../model/objectId";
import Transaction from "../../model/transaction";
import TransactionRepository from "../transaction";
export default class TransactionRepositoryInterpreter implements TransactionRepository {
    readonly connection: mongoose.Connection;
    constructor(connection: mongoose.Connection);
    find(conditions: Object): Promise<Transaction[]>;
    findById(id: ObjectId): Promise<monapt.Option<Transaction>>;
    findOne(conditions: Object): Promise<monapt.Option<Transaction>>;
    findOneAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Transaction>>;
    store(transaction: Transaction): Promise<void>;
}
