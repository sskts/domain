import mongoose = require("mongoose");
import monapt = require("monapt");
import Theater from "../../model/theater";
import TheaterRepository from "../theater";
import TheaterModel from "./mongoose/model/theater";

export default class TheaterRepositoryInterpreter implements TheaterRepository {
    constructor(readonly connection: mongoose.Connection) {
    }

    public async findById(id: string) {
        const model = this.connection.model(TheaterModel.modelName, TheaterModel.schema);
        const theater = await model.findOne({ _id: id }).lean().exec() as Theater;

        return (theater) ? monapt.Option(theater) : monapt.None;
    }

    public async store(theater: Theater) {
        const model = this.connection.model(TheaterModel.modelName, TheaterModel.schema);
        await model.findOneAndUpdate({ _id: theater._id }, theater, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}