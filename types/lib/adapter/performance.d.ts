/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import performanceModel from './mongoose/model/performance';
/**
 * パフォーマンスアダプター
 *
 * @export
 * @class PerformanceAdapter
 */
export default class PerformanceAdapter {
    model: typeof performanceModel;
    private readonly connection;
    constructor(connection: Connection);
}
