export interface IClientEvent {
    id: string;
    client: string;
    occurred_at: Date;
    url: string;
    label: string;
    category: string;
    action: string;
    message: string;
    notes: string;
    useragent: string;
    location: number[];
    transaction?: string;
}
export declare function create(args: {
    id?: string;
    client: string;
    occurred_at: Date;
    url?: string;
    label: string;
    category?: string;
    action?: string;
    message?: string;
    notes?: string;
    useragent?: string;
    location?: number[];
    transaction?: string;
}): IClientEvent;
