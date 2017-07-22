/**
 * タスク実行結果ファクトリー
 *
 * @namespace factory/taskExecutionResult
 */

import ObjectId from './objectId';

export interface ITaskExecutionResult {
    id: string;
    executedAt: Date;
    error: string;
}

export function create(args: {
    id?: string;
    executedAt: Date;
    error: string;
}): ITaskExecutionResult {
    // todo validation

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        executedAt: args.executedAt,
        error: args.error
    };
}
