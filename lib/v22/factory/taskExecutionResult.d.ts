export interface ITaskExecutionResult {
    id: string;
    executed_at: Date;
    error: string;
}
export declare function create(args: {
    id?: string;
    executed_at: Date;
    error: string;
}): ITaskExecutionResult;
