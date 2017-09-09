"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const action_1 = require("./mongoose/model/action");
/**
 * action repository
 * @class
 */
class MongoRepository {
    constructor(connection) {
        this.actionModel = connection.model(action_1.default.modelName);
    }
    pushPaymentInfo(transactionId, authorizeAction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.actionModel.findByIdAndUpdate(transactionId, { $push: { 'object.paymentInfos': authorizeAction } }).exec();
        });
    }
    pullPaymentInfo(transactionId, actionId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.actionModel.findByIdAndUpdate(transactionId, { $pull: { 'object.paymentInfos': { id: actionId } } }).exec();
        });
    }
    addSeatReservation(transactionId, authorizeAction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.actionModel.findByIdAndUpdate(transactionId, { 'object.seatReservation': authorizeAction }).exec();
        });
    }
    removeSeatReservation(transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.actionModel.findByIdAndUpdate(transactionId, { $unset: { 'object.seatReservation': 1 } }).exec();
        });
    }
    pushDiscountInfo(transactionId, authorizeAction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.actionModel.findByIdAndUpdate(transactionId, { $push: { 'object.discountInfos': authorizeAction } }).exec();
        });
    }
    pullDiscountInfo(transactionId, actionId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.actionModel.findByIdAndUpdate(transactionId, { $pull: { 'object.discountInfos': { id: actionId } } }).exec();
        });
    }
}
exports.MongoRepository = MongoRepository;
