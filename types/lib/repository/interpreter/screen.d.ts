/// <reference types="mongoose" />
import * as mongoose from "mongoose";
import * as monapt from "monapt";
import Screen from "../../model/screen";
import ScreenRepository from "../screen";
export default class ScreenRepositoryInterpreter implements ScreenRepository {
    readonly connection: mongoose.Connection;
    constructor(connection: mongoose.Connection);
    findById(id: string): Promise<monapt.Option<Screen>>;
    findByTheater(args: {
        /**
         * 劇場ID
         */
        theater_id: string;
    }): Promise<Screen[]>;
    store(screen: Screen): Promise<void>;
}
