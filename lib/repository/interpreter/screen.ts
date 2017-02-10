import mongoose = require("mongoose");
import monapt = require("monapt");
import Screen from "../../model/screen";
import ScreenRepository from "../screen";
import ScreenModel from "./mongoose/model/screen";

export default class ScreenRepositoryInterpreter implements ScreenRepository {
    constructor(readonly connection: mongoose.Connection) {
    }

    public async findById(id: string) {
        const model = this.connection.model(ScreenModel.modelName, ScreenModel.schema);
        const screen = await model.findOne({ _id: id })
        .populate("theater")
        .lean()
        .exec() as Screen;

        return (screen) ? monapt.Option(screen) : monapt.None;
    }

    public async findByTheater(args: {
        /** 劇場ID */
        theater_id: string,
    }) {
        const model = this.connection.model(ScreenModel.modelName, ScreenModel.schema);
        return await model.find({theater: args.theater_id})
        .populate("theater")
        .lean()
        .exec() as Screen[];
    }

    public async store(screen: Screen) {
        const model = this.connection.model(ScreenModel.modelName, ScreenModel.schema);
        await model.findOneAndUpdate({ _id: screen._id }, screen, {
            new: true,
            upsert: true,
        }).lean().exec();
    }
}