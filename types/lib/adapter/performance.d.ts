/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import * as Performance from '../factory/performance';
import performanceModel from './mongoose/model/performance';
export default class PerformanceAdapter {
    readonly connection: Connection;
    model: typeof performanceModel;
    constructor(connection: Connection);
    find(conditions: any): Promise<Performance.IPerformanceWithFilmAndScreen[]>;
    store(performance: Performance.IPerformance): Promise<void>;
}
