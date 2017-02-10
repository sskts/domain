import mongoose = require("mongoose");
import monapt = require("monapt");

import ObjectId from "../../model/objectId";
import Owner from "../../model/owner";
import PromoterOwner from "../../model/owner/promoter";
import OwnerGroup from "../../model/ownerGroup";

import OwnerRepository from "../owner";
import OwnerModel from "./mongoose/model/owner";

export default class OwnerRepositoryInterpreter implements OwnerRepository {
    constructor(readonly connection: mongoose.Connection) {
    }

    public async find(conditions: Object) {
        const model = this.connection.model(OwnerModel.modelName, OwnerModel.schema);
        return await model.find({ $and: [conditions] }).lean().exec() as Owner[];
    }

    public async findById(id: ObjectId) {
        const model = this.connection.model(OwnerModel.modelName, OwnerModel.schema);
        const owner = await model.findOne({ _id: id }).lean().exec() as Owner;

        return (owner) ? monapt.Option(owner) : monapt.None;
    }

    public async findPromoter() {
        const model = this.connection.model(OwnerModel.modelName, OwnerModel.schema);
        const owner = await model.findOne({ group: OwnerGroup.PROMOTER }).lean().exec() as PromoterOwner;

        return (owner) ? monapt.Option(owner) : monapt.None;
    }

    public async findOneAndUpdate(conditions: Object, update: Object) {
        const model = this.connection.model(OwnerModel.modelName, OwnerModel.schema);
        const owner = await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false,
        }).lean().exec() as Owner;

        return (owner) ? monapt.Option(owner) : monapt.None;
    }

    public async store(owner: Owner) {
        const model = this.connection.model(OwnerModel.modelName, OwnerModel.schema);
        await model.findOneAndUpdate({ _id: owner._id }, owner, {
            new: true,
            upsert: true,
        }).lean().exec();
    }
}