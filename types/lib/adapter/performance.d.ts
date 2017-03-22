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
    readonly model: typeof performanceModel;
    constructor(connection: Connection);
}
