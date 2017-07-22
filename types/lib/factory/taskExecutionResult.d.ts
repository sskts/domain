export interface ITaskExecutionResult {
    id: string;
    executedAt: Date;
    error: string;
}
export declare function create(args: {
    id?: string;
    executedAt: Date;
    error: string;
}): ITaskExecutionResult;
