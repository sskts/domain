/**
 * レポートサービス
 * 基本的に実験的実装中です。
 * 通常保守で必要なものを実装したり、思いつきのままにやっています。
 */
import * as TelemetryService from './report/telemetry';
import * as TransactionService from './report/transaction';

export {
    TelemetryService as telemetry,
    TransactionService as transaction
};
