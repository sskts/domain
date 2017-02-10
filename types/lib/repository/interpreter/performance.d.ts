/// <reference types="mongoose" />
import mongoose = require("mongoose");
import monapt = require("monapt");
import Performance from "../../model/performance";
import PerformanceRepository from "../performance";
export default class PerformanceRepositoryInterpreter implements PerformanceRepository {
    readonly connection: mongoose.Connection;
    constructor(connection: mongoose.Connection);
    find(conditions: Object): Promise<Performance[]>;
    findById(id: string): Promise<monapt.Option<Performance>>;
    store(performance: Performance): Promise<void>;
}
