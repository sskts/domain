import * as monapt from 'monapt';
import * as Performance from '../factory/performance';
/**
 * パフォーマンスリポジトリ
 *
 * @interface PerformanceAdapter
 */
interface IPerformanceAdapter {
    /**
     * ID検索
     *
     * @param {string} id
     */
    findById(id: string): Promise<monapt.Option<Performance.IPerformanceWithFilmAndScreen>>;
    /**
     * 検索
     *
     * @param {Object} conditions 検索条件
     */
    find(conditions: any): Promise<Performance.IPerformanceWithFilmAndScreen[]>;
    /**
     * 保管する
     *
     * @param {Performance} performance パフォーマンス
     */
    store(performance: Performance.IPerformance): Promise<void>;
}
export default IPerformanceAdapter;
