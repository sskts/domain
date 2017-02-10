/// <reference types="mongoose" />
import mongoose = require("mongoose");
import Asset from "../../model/asset";
import AssetRepository from "../asset";
export default class AssetRepositoryInterpreter implements AssetRepository {
    readonly connection: mongoose.Connection;
    constructor(connection: mongoose.Connection);
    store(asset: Asset): Promise<void>;
}
