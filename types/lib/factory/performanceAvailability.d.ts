export declare type Availability = '○' | '△' | '×' | '-';
export declare namespace Availability {
    const MANY = "○";
    const FEW = "△";
    const UNAVAILABLE = "×";
    const EXPIRED = "-";
}
export declare function create(day: string, numberOfAvailableSeats: number, numberOfAllSeats: number): Availability;
