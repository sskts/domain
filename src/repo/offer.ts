import * as COA from '@motionpicture/coa-service';

// import * as factory from '../factory';

export interface ICOATicket extends COA.services.master.ITicketResult {
    theaterCode: string;
}

/**
 * InMemoryオファーリポジトリ
 */
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
export class InMemoryRepository {
    public readonly coaTickets: ICOATicket[];

    constructor(coaTickets: ICOATicket[]) {
        this.coaTickets = coaTickets;
    }

    public searchCOATickets(params: { theaterCode?: string }) {
        let tickets = this.coaTickets;

        if (params.theaterCode !== undefined) {
            tickets = tickets.filter((t) => t.theaterCode === params.theaterCode);
        }

        return tickets;
    }
}
