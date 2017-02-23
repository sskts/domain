/// <reference types="mongoose" />
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import Performance from '../../model/performance';
import PerformanceRepository from '../performance';
export default class PerformanceRepositoryInterpreter implements PerformanceRepository {
    readonly connection: Connection;
    constructor(connection: Connection);
    find(conditions: Object): Promise<Performance[]>;
    findById(id: string): Promise<monapt.Option<Performance>>;
    store(performance: Performance): Promise<void>;
}
