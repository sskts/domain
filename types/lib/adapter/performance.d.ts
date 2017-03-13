/// <reference types="mongoose" />
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import * as Performance from '../factory/performance';
import performanceModel from './mongoose/model/performance';
export default class PerformanceAdapter {
    readonly connection: Connection;
    model: typeof performanceModel;
    constructor(connection: Connection);
    find(conditions: any): Promise<Performance.IPerformanceWithFilmAndScreen[]>;
    findById(id: string): Promise<monapt.Option<Performance.IPerformanceWithFilmAndScreen>>;
    store(performance: Performance.IPerformance): Promise<void>;
}
