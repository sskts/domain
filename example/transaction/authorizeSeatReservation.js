/**
 座席仮予約サンプル
 * @ignore
 */

const moment = require('moment');
const sskts = require('../../');

sskts.mongoose.connect(process.env.MONGOLAB_URI);

sskts.service.transaction.placeOrderInProgress.authorizeSeatReservation(
    '7q442so1c2hvcj8v5afr8k7ij',
    '59e5b5eeac9fea1f700d65ba',
    '11816221020171017301805',
    [
        {
            seatNumber: 'Ｂ－１',
            seatSection: '   ',
            ticketInfo: {
                addGlasses: 0,
                addPrice: 0,
                disPrice: 0,
                kbnEisyahousiki: '01',
                mvtkAppPrice: 700,
                mvtkKbnDenshiken: '01',
                mvtkKbnKensyu: '02',
                mvtkKbnMaeuriken: '01',
                mvtkNum: '7704671649',
                mvtkSalesPrice: 900,
                salePrice: 0,
                seatNum: 'Ｂ－１',
                stdPrice: 0,
                ticketCode: '3102',
                ticketCount: 1,
                ticketName: '【ﾑﾋﾞﾁｹ】小人',
                ticketNameEng: '',
                ticketNameKana: ''
            }
        }
    ]
)(
    new sskts.repository.Event(sskts.mongoose.connection),
    new sskts.repository.action.Authorize(sskts.mongoose.connection),
    new sskts.repository.Transaction(sskts.mongoose.connection)
    )
    .then(async (action) => {
        console.log('action is', action);
        sskts.mongoose.disconnect();
    })
    .catch((err) => {
        console.error(err);
        sskts.mongoose.disconnect();
    });