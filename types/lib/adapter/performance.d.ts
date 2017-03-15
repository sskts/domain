/// <reference types="mongoose" />
/**
 * パフォーマンスアダプター
 *
 * @class PerformanceAdapter
 */
import { Connection } from 'mongoose';
import performanceModel from './mongoose/model/performance';
export default class PerformanceAdapter {
    readonly connection: Connection;
    model: typeof performanceModel;
    constructor(connection: Connection);
}
