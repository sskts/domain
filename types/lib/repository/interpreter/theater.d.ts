/// <reference types="mongoose" />
import * as mongoose from "mongoose";
import * as monapt from "monapt";
import Theater from "../../model/theater";
import TheaterRepository from "../theater";
export default class TheaterRepositoryInterpreter implements TheaterRepository {
    readonly connection: mongoose.Connection;
    constructor(connection: mongoose.Connection);
    findById(id: string): Promise<monapt.Option<Theater>>;
    store(theater: Theater): Promise<void>;
}
