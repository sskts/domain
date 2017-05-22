export declare type IPerformanceStockStatus = '○' | '△' | '×' | '-';
export declare namespace IPerformanceStockStatus {
    const MANY = "○";
    const FEW = "△";
    const UNAVAILABLE = "×";
    const EXPIRED = "-";
}
export declare function create(day: string, numberOfAvailableSeats: number, numberOfAllSeats: number): IPerformanceStockStatus;
