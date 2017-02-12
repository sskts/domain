import mongoose = require("mongoose");
import monapt = require("monapt");
import * as TransactionFactory from "../../factory/transaction";
import ObjectId from "../../model/objectId";
import Transaction from "../../model/transaction";
import TransactionRepository from "../transaction";
import TransactionModel from "./mongoose/model/transaction";

export default class TransactionRepositoryInterpreter implements TransactionRepository {
    constructor(readonly connection: mongoose.Connection) {
    }

    public async find(conditions: Object) {
        const model = this.connection.model(TransactionModel.modelName, TransactionModel.schema);
        const docs = await model.find()
            .where(conditions)
            .populate("owner")
            .lean()
            .exec() as any[];

        return docs.map(TransactionFactory.create);
    }

    public async findById(id: ObjectId) {
        const model = this.connection.model(TransactionModel.modelName, TransactionModel.schema);
        const doc = await model.findOne()
            .where("_id").equals(id)
            .populate("owners").lean().exec() as any;

        return (doc) ? monapt.Option(TransactionFactory.create(doc)) : monapt.None;
    }

    public async findOne(conditions: Object) {
        const model = this.connection.model(TransactionModel.modelName, TransactionModel.schema);
        const doc = await model.findOne(conditions).lean().exec() as any;

        return (doc) ? monapt.Option(TransactionFactory.create(doc)) : monapt.None;
    }

    public async findOneAndUpdate(conditions: Object, update: Object) {
        const model = this.connection.model(TransactionModel.modelName, TransactionModel.schema);
        const doc = await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        }).lean().exec() as any;

        return (doc) ? monapt.Option(TransactionFactory.create(doc)) : monapt.None;
    }

    public async store(transaction: Transaction) {
        const model = this.connection.model(TransactionModel.modelName, TransactionModel.schema);
        await model.findOneAndUpdate({ _id: transaction._id }, transaction, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}