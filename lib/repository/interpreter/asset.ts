import mongoose = require("mongoose");
import Asset from "../../model/asset";
import AssetRepository from "../asset";
import AssetModel from "./mongoose/model/asset";

export default class AssetRepositoryInterpreter implements AssetRepository {
    constructor(readonly connection: mongoose.Connection) {
    }

    public async store(asset: Asset) {
        const model = this.connection.model(AssetModel.modelName, AssetModel.schema);
        await model.findOneAndUpdate({ _id: asset._id }, asset, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}