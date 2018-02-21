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
    const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
    const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

    const agentId = 'agentId';

    const placeOrderService = sskts.service.transaction.placeOrderInProgress;
    const transaction = await placeOrderService.start({
        // tslint:disable-next-line:no-magic-numbers
        expires: moment().add(30, 'minutes').toDate(),
        agentId: agentId,
        sellerId: '59d20831e53ebc2b4e774466',
        clientUser: {
            client_id: 'testclient',
            iss: 'testissuer'
        },
        passportToken: passportToken
    })(organizationRepo, transactionRepo);
    console.log('transaction started.', transaction.id);

    const eventIdentifier = '11899500020180222600920';

    // このサンプルは1座席購入なので、制限単位が1枚以上の券種に絞る
    const salesTicketResult = await sskts.COA.services.reserve.salesTicket({
        theaterCode: '118',
        dateJouei: '20180222',
        titleCode: '99500',
        titleBranchNum: '0',
        timeBegin: '0920'
    }).then((results) => results.filter((result) => result.limitUnit === '001' && result.limitCount === 1));
    console.log('salesTicketResult:', salesTicketResult);

    // search available seats from sskts.COA
    const getStateReserveSeatResult = await sskts.COA.services.reserve.stateReserveSeat({
        theaterCode: '118',
        dateJouei: '20180222',
        titleCode: '99500',
        titleBranchNum: '0',
        timeBegin: '0920',
        screenCode: '60'
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
    )(eventRepo, actionRepo, transactionRepo);
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
    const accessToken = 'eyJraWQiOiI0eVpocWlFZlFRVEVmSTNERlA1ZjBWQXpwazFLekFBa3RQd2haSGZHdzBzPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJhZWJhZjU3My05OGMxLTRjZWEtODRiZi1lMjBlYmRjNjg2OWEiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIG9wZW5pZCBwcm9maWxlIGh0dHBzOlwvXC9zc2t0cy1hcGktZGV2ZWxvcG1lbnQuYXp1cmV3ZWJzaXRlcy5uZXRcL3BsYWNlcy5yZWFkLW9ubHkgaHR0cHM6XC9cL3Nza3RzLWFwaS1kZXZlbG9wbWVudC5henVyZXdlYnNpdGVzLm5ldFwvcGVvcGxlLmNyZWRpdENhcmRzLnJlYWQtb25seSBodHRwczpcL1wvcGVjb3Jpbm8tYXBpLWRldmVsb3BtZW50LmF6dXJld2Vic2l0ZXMubmV0XC9hY2NvdW50cy5yZWFkLW9ubHkgaHR0cHM6XC9cL3BlY29yaW5vLWFwaS1kZXZlbG9wbWVudC5henVyZXdlYnNpdGVzLm5ldFwvYWNjb3VudHMuYWN0aW9ucy5yZWFkLW9ubHkgaHR0cHM6XC9cL3Nza3RzLWFwaS1kZXZlbG9wbWVudC5henVyZXdlYnNpdGVzLm5ldFwvcGVvcGxlLmNvbnRhY3RzIGh0dHBzOlwvXC9zc2t0cy1hcGktZGV2ZWxvcG1lbnQuYXp1cmV3ZWJzaXRlcy5uZXRcL3Blb3BsZS5jb250YWN0cy5yZWFkLW9ubHkgaHR0cHM6XC9cL3Nza3RzLWFwaS1kZXZlbG9wbWVudC5henVyZXdlYnNpdGVzLm5ldFwvcGVvcGxlLm93bmVyc2hpcEluZm9zIGh0dHBzOlwvXC9zc2t0cy1hcGktZGV2ZWxvcG1lbnQuYXp1cmV3ZWJzaXRlcy5uZXRcL3Blb3BsZS5vd25lcnNoaXBJbmZvcy5yZWFkLW9ubHkgaHR0cHM6XC9cL3BlY29yaW5vLWFwaS1kZXZlbG9wbWVudC5henVyZXdlYnNpdGVzLm5ldFwvdHJhbnNhY3Rpb25zIHBob25lIGh0dHBzOlwvXC9zc2t0cy1hcGktZGV2ZWxvcG1lbnQuYXp1cmV3ZWJzaXRlcy5uZXRcL2V2ZW50cy5yZWFkLW9ubHkgaHR0cHM6XC9cL3Nza3RzLWFwaS1kZXZlbG9wbWVudC5henVyZXdlYnNpdGVzLm5ldFwvcGVvcGxlLmFjY291bnRzLmFjdGlvbnMucmVhZC1vbmx5IGh0dHBzOlwvXC9zc2t0cy1hcGktZGV2ZWxvcG1lbnQuYXp1cmV3ZWJzaXRlcy5uZXRcL29yZ2FuaXphdGlvbnMucmVhZC1vbmx5IGh0dHBzOlwvXC9zc2t0cy1hcGktZGV2ZWxvcG1lbnQuYXp1cmV3ZWJzaXRlcy5uZXRcL29yZGVycy5yZWFkLW9ubHkgaHR0cHM6XC9cL3Nza3RzLWFwaS1kZXZlbG9wbWVudC5henVyZXdlYnNpdGVzLm5ldFwvcGVvcGxlLmNyZWRpdENhcmRzIGh0dHBzOlwvXC9zc2t0cy1hcGktZGV2ZWxvcG1lbnQuYXp1cmV3ZWJzaXRlcy5uZXRcL3RyYW5zYWN0aW9ucyBodHRwczpcL1wvc3NrdHMtYXBpLWRldmVsb3BtZW50LmF6dXJld2Vic2l0ZXMubmV0XC9wZW9wbGUuYWNjb3VudHMucmVhZC1vbmx5IGVtYWlsIiwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmFwLW5vcnRoZWFzdC0xLmFtYXpvbmF3cy5jb21cL2FwLW5vcnRoZWFzdC0xX2xucVVldmlYaiIsImV4cCI6MTUxOTE5ODgyOSwiaWF0IjoxNTE5MTk1MjI5LCJ2ZXJzaW9uIjoyLCJqdGkiOiJkMTQ2OTUzOC0zNmU3LTQwNjMtOGMxNC05MjVmMThlNTI5NTkiLCJjbGllbnRfaWQiOiJpdDIwN29lYXRiZDdmamRjdnNmM3Jtc2t1IiwidXNlcm5hbWUiOiJpbG92ZWdhZGQifQ.h95yuwXYUcmZdYgGM0mXz-c_5l4Ugxu6TVwA_PYZEhO0lEd9POe_CkOcJifYu8c_rpw_28zU6X4aNw3rTKOR0_dayWjNu4AKBiuasCNrajK82KFeSlsJKCsPy_QIguk0Vp_8W2G7PDtdDa7wevt8V1Er9gsZRMqqXgr0PYjzTki2oJkZ29PVMAVtatjqQjC5I2kEDvHXMFnjSi1PKA0vB_P4_2O1GvvrBci_koOwlmMCcGbx5RIz81M3xYB9WSIdDxiCi0W4oKz47rOdrUnwehqebMlt56Xar9gj8qhK9cQqYCwQWTpK7t6niIvotfSXVkFnmsACOQlhNR9HjKKovg';
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
        agentId, transaction.id, searReservationAuthorization.result.price
    )(actionRepo, transactionRepo, payTransactionService);
    console.log('Pecorino残高確認済');

    const transactionResult = await placeOrderService.confirm(agentId, transaction.id)(
        actionRepo,
        transactionRepo,
        organizationRepo
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
