"use strict";
/**
 * 取引プロセスサンプル
 *
 * @ignore
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const COA = require("@motionpicture/coa-service");
const createDebug = require("debug");
const moment = require("moment");
const mongoose = require("mongoose");
const redis = require("redis");
const sskts = require("../lib/index");
const debug = createDebug('sskts-domain:examples');
// tslint:disable-next-line:max-func-body-length
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        mongoose.Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        const redisClient = redis.createClient({
            host: process.env.TEST_REDIS_HOST,
            port: process.env.TEST_REDIS_PORT,
            password: process.env.TEST_REDIS_KEY,
            tls: { servername: process.env.TEST_REDIS_HOST }
        });
        const eventAdapter = sskts.adapter.event(connection);
        const organizationAdapter = sskts.adapter.organization(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);
        const transactionCountAdapter = sskts.adapter.transactionCount(redisClient);
        // 劇場ショップ検索
        const movieTheaters = yield sskts.service.organization.searchMovieTheaters({})(organizationAdapter);
        // 取引開始
        debug('starting transaction...');
        const readyFrom = moment();
        const readyUntil = moment(readyFrom).add(1, 'minute');
        const scope = sskts.factory.transactionScope.create({
            readyFrom: readyFrom.toDate(),
            readyThrough: readyUntil.toDate()
        });
        const transactionOption = yield sskts.service.transaction.placeOrder.start({
            // tslint:disable-next-line:no-magic-numbers
            expires: moment().add(1, 'minutes').toDate(),
            maxCountPerUnit: 120,
            scope: scope,
            clientUser: {
                client_id: 'cq8em79ileeqlcp6q5kkd446n',
                jti: 'cf7c2a05-5ab6-4fc6-a3c1-ec6c6fc9254f',
                version: 2,
                iat: 1502954230,
                exp: 1502957830,
                iss: 'iss',
                scope: 'https://sskts-api-development.azurewebsites.net/transactions',
                token_use: 'access',
                sub: 'cq8em79ileeqlcp6q5kkd446n'
            },
            sellerId: movieTheaters[0].id
        })(organizationAdapter, transactionAdapter, transactionCountAdapter);
        if (transactionOption.isEmpty) {
            throw new Error('no ready transaction');
        }
        debug('transaction started.');
        const transaction = transactionOption.get();
        const transactionId = transaction.id;
        // 空席なくなったら変更する
        const individualScreeningEventIdentifier = '11816250020170804701455';
        const individualScreeningEventOption = yield sskts.service.event.findIndividualScreeningEventByIdentifier(individualScreeningEventIdentifier)(eventAdapter);
        const individualScreeningEvent = individualScreeningEventOption.get();
        const theaterCode = individualScreeningEvent.coaInfo.theaterCode;
        const dateJouei = individualScreeningEvent.coaInfo.dateJouei;
        const titleCode = individualScreeningEvent.coaInfo.titleCode;
        const titleBranchNum = individualScreeningEvent.coaInfo.titleBranchNum;
        const timeBegin = individualScreeningEvent.coaInfo.timeBegin;
        const screenCode = individualScreeningEvent.coaInfo.screenCode;
        // 販売可能チケット検索
        const salesTicketResult = yield COA.services.reserve.salesTicket({
            theaterCode: theaterCode,
            dateJouei: dateJouei,
            titleCode: titleCode,
            titleBranchNum: titleBranchNum,
            timeBegin: timeBegin
        });
        // COA空席確認
        const getStateReserveSeatResult = yield COA.services.reserve.stateReserveSeat({
            theaterCode: theaterCode,
            dateJouei: dateJouei,
            titleCode: titleCode,
            titleBranchNum: titleBranchNum,
            timeBegin: timeBegin,
            screenCode: screenCode
        });
        const sectionCode = getStateReserveSeatResult.listSeat[0].seatSection;
        const freeSeatCodes = getStateReserveSeatResult.listSeat[0].listFreeSeat.map((freeSeat) => {
            return freeSeat.seatNum;
        });
        debug('freeSeatCodes count', freeSeatCodes.length);
        if (getStateReserveSeatResult.cntReserveFree === 0)
            throw new Error('no available seats.');
        // COAオーソリ追加
        debug('adding authorizations coaSeatReservation...');
        const offers = [
            {
                seatSection: sectionCode,
                seatNumber: freeSeatCodes[0],
                ticket: {
                    ticketCode: salesTicketResult[0].ticketCode,
                    ticketName: salesTicketResult[0].ticketName,
                    ticketNameEng: salesTicketResult[0].ticketNameEng,
                    ticketNameKana: salesTicketResult[0].ticketNameKana,
                    stdPrice: salesTicketResult[0].stdPrice,
                    addPrice: salesTicketResult[0].addPrice,
                    disPrice: 0,
                    salePrice: salesTicketResult[0].salePrice,
                    mvtkAppPrice: 0,
                    addGlasses: 0,
                    kbnEisyahousiki: '00',
                    mvtkNum: '',
                    mvtkKbnDenshiken: '00',
                    mvtkKbnMaeuriken: '00',
                    mvtkKbnKensyu: '00',
                    mvtkSalesPrice: 0,
                    ticketCount: 1,
                    seatNum: freeSeatCodes[0]
                }
            },
            {
                seatSection: sectionCode,
                seatNumber: freeSeatCodes[1],
                ticket: {
                    ticketCode: salesTicketResult[0].ticketCode,
                    ticketName: salesTicketResult[0].ticketName,
                    ticketNameEng: salesTicketResult[0].ticketNameEng,
                    ticketNameKana: salesTicketResult[0].ticketNameKana,
                    stdPrice: salesTicketResult[0].stdPrice,
                    addPrice: salesTicketResult[0].addPrice,
                    disPrice: 0,
                    salePrice: salesTicketResult[0].salePrice,
                    mvtkAppPrice: 0,
                    addGlasses: 0,
                    kbnEisyahousiki: '00',
                    mvtkNum: '',
                    mvtkKbnDenshiken: '00',
                    mvtkKbnMaeuriken: '00',
                    mvtkKbnKensyu: '00',
                    mvtkSalesPrice: 0,
                    ticketCount: 1,
                    seatNum: freeSeatCodes[1]
                }
            }
        ];
        const amount = salesTicketResult[0].salePrice + salesTicketResult[0].salePrice;
        const coaAuthorization = yield sskts.service.transaction.placeOrder.createSeatReservationAuthorization(transactionId, individualScreeningEvent, offers)(transactionAdapter);
        debug('coaAuthorization added');
        // COAオーソリ削除
        yield sskts.service.transaction.placeOrder.cancelSeatReservationAuthorization(transactionId, coaAuthorization.id)(transactionAdapter);
        debug('coaAuthorization deleted');
        // COAオーソリ追加
        debug('adding authorizations coaSeatReservation...');
        yield sskts.service.transaction.placeOrder.createSeatReservationAuthorization(transactionId, individualScreeningEvent, offers)(transactionAdapter);
        debug('coaAuthorization added');
        // GMOオーソリ追加
        debug('adding authorizations gmo...');
        let orderId = Date.now().toString();
        const gmoAuthorization = yield sskts.service.transaction.placeOrder.createCreditCardAuthorization(transactionId, orderId, amount, sskts.GMO.utils.util.Method.Lump, {
            cardNo: '4111111111111111',
            expire: '2012',
            securityCode: '123'
        })(organizationAdapter, transactionAdapter);
        debug('GMOAuthorization added.');
        yield sskts.service.transaction.placeOrder.cancelGMOAuthorization(transactionId, gmoAuthorization.id)(transactionAdapter);
        debug('GMOAuthorization deleted');
        // GMOオーソリ追加
        debug('adding authorizations gmo...');
        orderId = Date.now().toString();
        yield sskts.service.transaction.placeOrder.createCreditCardAuthorization(transactionId, orderId, amount, sskts.GMO.utils.util.Method.Lump, {
            cardNo: '4111111111111111',
            expire: '2012',
            securityCode: '123'
        })(organizationAdapter, transactionAdapter);
        debug('GMOAuthorization added.');
        // 購入者情報登録
        debug('updating agent profile...');
        const telephone = '09012345678';
        const profile = {
            givenName: 'Tetsu',
            familyName: 'Yamazaki',
            telephone: telephone,
            email: process.env.SSKTS_DEVELOPER_EMAIL
        };
        yield sskts.service.transaction.placeOrder.setAgentProfile(transactionId, profile)(transactionAdapter);
        debug('agent profile updated.');
        // 取引成立
        debug('confirming transaction...');
        const order = yield sskts.service.transaction.placeOrder.confirm(transactionId)(transactionAdapter);
        debug('confirmed', order);
        redisClient.quit();
        mongoose.disconnect();
    });
}
main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
