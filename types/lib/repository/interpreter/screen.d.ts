/// <reference types="mongoose" />
import mongoose = require("mongoose");
import monapt = require("monapt");
import Screen from "../../model/screen";
import ScreenRepository from "../screen";
export default class ScreenRepositoryInterpreter implements ScreenRepository {
    readonly connection: mongoose.Connection;
    constructor(connection: mongoose.Connection);
    findById(id: string): Promise<monapt.Option<Screen>>;
    findByTheater(args: {
        /** 劇場ID */
        theater_id: string;
    }): Promise<Screen[]>;
    store(screen: Screen): Promise<void>;
}
