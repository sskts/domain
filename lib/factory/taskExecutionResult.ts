/**
 * タスク実行結果ファクトリー
 *
 * @namespace factory/taskExecutionResult
 */

import ObjectId from './objectId';

export interface ITaskExecutionResult {
    id: string;
    executed_at: Date;
    error: string;
}

export function create(args: {
    id?: string;
    executed_at: Date;
    error: string;
}): ITaskExecutionResult {
    // todo validation

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        executed_at: args.executed_at,
        error: args.error
    };
}
