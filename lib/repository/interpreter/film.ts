import mongoose = require("mongoose");
import monapt = require("monapt");
import FilmFactory from "../../factory/film";
import Film from "../../model/film";
import FilmRepository from "../film";
import FilmModel from "./mongoose/model/film";

export default class FilmRepositoryInterpreter implements FilmRepository {
    constructor(readonly connection: mongoose.Connection) {
    }

    public async findById(id: string) {
        const model = this.connection.model(FilmModel.modelName, FilmModel.schema);
        const doc = await model.findOne({ _id: id }).lean().exec() as any;

        return (doc) ? monapt.Option(FilmFactory.create(doc)) : monapt.None;
    }

    public async store(film: Film) {
        const model = this.connection.model(FilmModel.modelName, FilmModel.schema);
        await model.findOneAndUpdate({ _id: film._id }, film, {
            new: true,
            upsert: true,
        }).lean().exec();
    }
}