/// <reference types="mongoose" />
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import * as Performance from '../../factory/performance';
import PerformanceAdapter from '../performance';
export default class PerformanceAdapterInterpreter implements PerformanceAdapter {
    readonly connection: Connection;
    private model;
    constructor(connection: Connection);
    find(conditions: any): Promise<Performance.IPerformanceWithFilmAndScreen[]>;
    findById(id: string): Promise<monapt.Option<Performance.IPerformanceWithFilmAndScreen>>;
    store(performance: Performance.IPerformance): Promise<void>;
}
