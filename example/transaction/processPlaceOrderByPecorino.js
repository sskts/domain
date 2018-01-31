/**
 * Pecorino決済での注文プロセス
 * @ignore
 */

const moment = require('moment');
const request = require('request-promise-native');
const sskts = require('../../');

sskts.mongoose.connect(process.env.MONGOLAB_URI);

async function main() {

    // 許可証トークンパラメーターがなければ、WAITERで許可証を取得
    const passportToken = await request.post(
        `${process.env.WAITER_ENDPOINT}/passports`,
        {
            body: {
                scope: `placeOrderTransaction.MovieTheater-118`
            },
            json: true
        }
    ).then((body) => body.token);
    console.log('passportToken published.', passportToken);

    const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
    const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
    const creditCardAuthorizeActionRepo = new sskts.repository.action.authorize.CreditCard(sskts.mongoose.connection);
    const mvtkAuthorizeActionRepo = new sskts.repository.action.authorize.Mvtk(sskts.mongoose.connection);
    const seatReservationAuthorizeActionRepo = new sskts.repository.action.authorize.SeatReservation(sskts.mongoose.connection);
    const pecorinoAuthorizeActionRepo = new sskts.repository.action.authorize.Pecorino(sskts.mongoose.connection);
    const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

    const agentId = 'agentId';

    const placeOrderService = sskts.service.transaction.placeOrderInProgress;
    const transaction = await placeOrderService.start({
        // tslint:disable-next-line:no-magic-numbers
        expires: moment().add(30, 'minutes').toDate(),
        agentId: agentId,
        sellerId: '59d20831e53ebc2b4e774466',
        clientUser: {},
        passportToken: passportToken
    })(organizationRepo, transactionRepo);
    console.log('transaction started.', transaction.id);

    const eventIdentifier = '11899315020180131201010';

    // このサンプルは1座席購入なので、制限単位が1枚以上の券種に絞る
    const salesTicketResult = await sskts.COA.services.reserve.salesTicket({
        theaterCode: '118',
        dateJouei: '20180131',
        titleCode: '99315',
        titleBranchNum: '0',
        timeBegin: '1010'
    }).then((results) => results.filter((result) => result.limitUnit === '001' && result.limitCount === 1));
    console.log('salesTicketResult:', salesTicketResult);

    // search available seats from sskts.COA
    const getStateReserveSeatResult = await sskts.COA.services.reserve.stateReserveSeat({
        theaterCode: '118',
        dateJouei: '20180131',
        titleCode: '99315',
        titleBranchNum: '0',
        timeBegin: '1010',
        screenCode: '20'
    });
    console.log('getStateReserveSeatResult:', getStateReserveSeatResult);
    const sectionCode = getStateReserveSeatResult.listSeat[0].seatSection;
    const freeSeatCodes = getStateReserveSeatResult.listSeat[0].listFreeSeat.map((freeSeat) => {
        return freeSeat.seatNum;
    });
    console.log('sectionCode:', sectionCode);
    console.log('freeSeatCodes:', freeSeatCodes);
    if (getStateReserveSeatResult.cntReserveFree <= 0) {
        throw new Error('no available seats');
    }

    const selectedSeatCode = freeSeatCodes[Math.floor(freeSeatCodes.length * Math.random())];

    // select a ticket randomly
    let selectedSalesTicket = salesTicketResult[Math.floor(salesTicketResult.length * Math.random())];

    const searReservationAuthorization = await placeOrderService.action.authorize.seatReservation.create(
        agentId,
        transaction.id,
        eventIdentifier,
        [
            {
                seatSection: sectionCode,
                seatNumber: selectedSeatCode,
                ticketInfo: {
                    ticketCode: selectedSalesTicket.ticketCode,
                    mvtkAppPrice: 0,
                    ticketCount: 1,
                    addGlasses: selectedSalesTicket.addGlasses,
                    kbnEisyahousiki: '00',
                    mvtkNum: '',
                    mvtkKbnDenshiken: '00',
                    mvtkKbnMaeuriken: '00',
                    mvtkKbnKensyu: '00',
                    mvtkSalesPrice: 0
                }
            }
        ]
    )(eventRepo, seatReservationAuthorizeActionRepo, transactionRepo);
    console.log('座席確保', searReservationAuthorization.id);

    // 購入者情報
    await placeOrderService.setCustomerContact(
        agentId, transaction.id, {
            givenName: 'たろう',
            familyName: 'もーしょん',
            telephone: '09012345678',
            email: process.env.SSKTS_DEVELOPER_EMAIL
        }
    )(transactionRepo);
    console.log('購入者情報登録済');

    // pecorino支払取引サービスクライアントを生成
    const accessToken = 'eyJraWQiOiI0eVpocWlFZlFRVEVmSTNERlA1ZjBWQXpwazFLekFBa3RQd2haSGZHdzBzPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJhZWJhZjU3My05OGMxLTRjZWEtODRiZi1lMjBlYmRjNjg2OWEiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIG9wZW5pZCBwcm9maWxlIGh0dHBzOlwvXC9zc2t0cy1hcGktZGV2ZWxvcG1lbnQuYXp1cmV3ZWJzaXRlcy5uZXRcL3BsYWNlcy5yZWFkLW9ubHkgaHR0cHM6XC9cL3Nza3RzLWFwaS1kZXZlbG9wbWVudC5henVyZXdlYnNpdGVzLm5ldFwvcGVvcGxlLmNyZWRpdENhcmRzLnJlYWQtb25seSBodHRwczpcL1wvcGVjb3Jpbm8tYXBpLWRldmVsb3BtZW50LmF6dXJld2Vic2l0ZXMubmV0XC9hY2NvdW50cy5hY3Rpb25zLnJlYWQtb25seSBodHRwczpcL1wvc3NrdHMtYXBpLWRldmVsb3BtZW50LmF6dXJld2Vic2l0ZXMubmV0XC9wZW9wbGUuY29udGFjdHMgaHR0cHM6XC9cL3Nza3RzLWFwaS1kZXZlbG9wbWVudC5henVyZXdlYnNpdGVzLm5ldFwvcGVvcGxlLmNvbnRhY3RzLnJlYWQtb25seSBodHRwczpcL1wvc3NrdHMtYXBpLWRldmVsb3BtZW50LmF6dXJld2Vic2l0ZXMubmV0XC9wZW9wbGUub3duZXJzaGlwSW5mb3MgaHR0cHM6XC9cL3Nza3RzLWFwaS1kZXZlbG9wbWVudC5henVyZXdlYnNpdGVzLm5ldFwvcGVvcGxlLm93bmVyc2hpcEluZm9zLnJlYWQtb25seSBodHRwczpcL1wvcGVjb3Jpbm8tYXBpLWRldmVsb3BtZW50LmF6dXJld2Vic2l0ZXMubmV0XC90cmFuc2FjdGlvbnMgcGhvbmUgaHR0cHM6XC9cL3Nza3RzLWFwaS1kZXZlbG9wbWVudC5henVyZXdlYnNpdGVzLm5ldFwvZXZlbnRzLnJlYWQtb25seSBodHRwczpcL1wvc3NrdHMtYXBpLWRldmVsb3BtZW50LmF6dXJld2Vic2l0ZXMubmV0XC9vcmdhbml6YXRpb25zLnJlYWQtb25seSBodHRwczpcL1wvc3NrdHMtYXBpLWRldmVsb3BtZW50LmF6dXJld2Vic2l0ZXMubmV0XC9vcmRlcnMucmVhZC1vbmx5IGh0dHBzOlwvXC9zc2t0cy1hcGktZGV2ZWxvcG1lbnQuYXp1cmV3ZWJzaXRlcy5uZXRcL3Blb3BsZS5jcmVkaXRDYXJkcyBodHRwczpcL1wvc3NrdHMtYXBpLWRldmVsb3BtZW50LmF6dXJld2Vic2l0ZXMubmV0XC90cmFuc2FjdGlvbnMgZW1haWwiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtbm9ydGhlYXN0LTEuYW1hem9uYXdzLmNvbVwvYXAtbm9ydGhlYXN0LTFfbG5xVWV2aVhqIiwiZXhwIjoxNTE3MzE1MTYxLCJpYXQiOjE1MTczMTE1NjEsInZlcnNpb24iOjIsImp0aSI6ImVjYzhkY2UzLWFmOTgtNGMwNi05MDYwLWYwN2UyNDM4ODhhZSIsImNsaWVudF9pZCI6Iml0MjA3b2VhdGJkN2ZqZGN2c2Yzcm1za3UiLCJ1c2VybmFtZSI6Imlsb3ZlZ2FkZCJ9.Ru9YRQ75l_QJM0Me7LQMwJky-oUZa3lDOMTDeky4bP-OyG7DycEizq_dTVrrR5nslCMSdh4jiSKQLAD6UteQp0KHpbuhV5pGSUPCrwZdh2CIgGqgSx-Zp9QWFd8C4lD5RhBGhVYLGGgZOAN034jq9EFsKyEkNCjcwyr1uogKYtveqBL_4MVP3ZzvkhwpBVjMZ7AIAJ7uUyPRk3KPTdvqXXUfxu5IDt7h4hR2_7LtHc2eVwvpfNRPBZo_uQUs5YTYcbZ4dOe3nX8RqGsPsUg9Net2QJyFWWzpyPdwyl_BPr332dhgHKanKiYB2o-31OtSeHTr7nZY4XwEa3kqy22IAA';
    const oauth2client = new sskts.pecorinoapi.auth.OAuth2({
        domain: process.env.PECORINO_AUTHORIZE_SERVER_DOMAIN
    });
    oauth2client.setCredentials({
        access_token: accessToken
    });
    const payTransactionService = new sskts.pecorinoapi.service.transaction.Pay({
        endpoint: process.env.PECORINO_API_ENDPOINT,
        auth: oauth2client
    });

    await placeOrderService.action.authorize.pecorino.create(
        agentId, transaction.id, 'accountId', searReservationAuthorization.result.price
    )(pecorinoAuthorizeActionRepo, transactionRepo, payTransactionService);
    console.log('Pecorino残高確認済');

    const transactionResult = await placeOrderService.confirm(agentId, transaction.id)(
        creditCardAuthorizeActionRepo,
        mvtkAuthorizeActionRepo,
        seatReservationAuthorizeActionRepo,
        transactionRepo,
        pecorinoAuthorizeActionRepo
    );
    console.log('取引確定', transactionResult.orderNumber);
}

main().then(() => {
    console.log('succeess!');
}).catch((err) => {
    console.error(err);
}).then(() => {
    sskts.mongoose.disconnect();
});
