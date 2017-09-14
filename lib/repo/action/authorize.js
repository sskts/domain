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
const factory = require("@motionpicture/sskts-factory");
const action_1 = require("../mongoose/model/action");
/**
 * authorize action repository
 * @class
 */
class MongoRepository {
    constructor(connection) {
        this.actionModel = connection.model(action_1.default.modelName);
    }
    startCreditCard(agent, recipient, object) {
        return __awaiter(this, void 0, void 0, function* () {
            const actionAttributes = factory.action.authorize.creditCard.createAttributes({
                actionStatus: factory.actionStatusType.ActiveActionStatus,
                object: object,
                agent: agent,
                recipient: recipient,
                startDate: new Date()
            });
            return yield this.actionModel.create(actionAttributes).then((doc) => doc.toObject());
        });
    }
    completeCreditCard(actionId, result) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.actionModel.findByIdAndUpdate(actionId, {
                actionStatus: factory.actionStatusType.CompletedActionStatus,
                result: result,
                endDate: new Date()
            }, { new: true }).exec().then((doc) => {
                if (doc === null) {
                    throw new factory.errors.NotFound('authorizeAction');
                }
                return doc.toObject();
            });
        });
    }
    cancelCreditCard(actionId, transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.actionModel.findOneAndUpdate({
                _id: actionId,
                typeOf: factory.actionType.AuthorizeAction,
                'object.transactionId': transactionId,
                'purpose.typeOf': factory.action.authorize.authorizeActionPurpose.CreditCard
            }, { actionStatus: factory.actionStatusType.CanceledActionStatus }, { new: true }).exec()
                .then((doc) => {
                if (doc === null) {
                    throw new factory.errors.NotFound('authorizeAction');
                }
                return doc.toObject();
            });
        });
    }
    startMvtk(agent, recipient, object) {
        return __awaiter(this, void 0, void 0, function* () {
            const actionAttributes = factory.action.authorize.mvtk.createAttributes({
                actionStatus: factory.actionStatusType.ActiveActionStatus,
                object: object,
                agent: agent,
                recipient: recipient,
                startDate: new Date()
            });
            return yield this.actionModel.create(actionAttributes).then((doc) => doc.toObject());
        });
    }
    completeMvtk(actionId, result) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.actionModel.findByIdAndUpdate(actionId, {
                actionStatus: factory.actionStatusType.CompletedActionStatus,
                result: result,
                endDate: new Date()
            }, { new: true }).exec().then((doc) => {
                if (doc === null) {
                    throw new factory.errors.NotFound('authorizeAction');
                }
                return doc.toObject();
            });
        });
    }
    cancelMvtk(actionId, transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.actionModel.findOneAndUpdate({
                _id: actionId,
                typeOf: factory.actionType.AuthorizeAction,
                'object.transactionId': transactionId,
                'purpose.typeOf': factory.action.authorize.authorizeActionPurpose.Mvtk
            }, { actionStatus: factory.actionStatusType.CanceledActionStatus }, { new: true }).exec()
                .then((doc) => {
                if (doc === null) {
                    throw new factory.errors.NotFound('authorizeAction');
                }
                return doc.toObject();
            });
        });
    }
    startSeatReservation(agent, recipient, object) {
        return __awaiter(this, void 0, void 0, function* () {
            const actionAttributes = factory.action.authorize.seatReservation.createAttributes({
                actionStatus: factory.actionStatusType.ActiveActionStatus,
                object: object,
                agent: agent,
                recipient: recipient,
                startDate: new Date()
            });
            return yield this.actionModel.create(actionAttributes).then((doc) => doc.toObject());
        });
    }
    completeSeatReservation(actionId, result) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.actionModel.findByIdAndUpdate(actionId, {
                actionStatus: factory.actionStatusType.CompletedActionStatus,
                result: result,
                endDate: new Date()
            }, { new: true }).exec().then((doc) => {
                if (doc === null) {
                    throw new factory.errors.NotFound('authorizeAction');
                }
                return doc.toObject();
            });
        });
    }
    cancelSeatReservation(actionId, transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.actionModel.findOneAndUpdate({
                _id: actionId,
                typeOf: factory.actionType.AuthorizeAction,
                'object.transactionId': transactionId,
                'purpose.typeOf': factory.action.authorize.authorizeActionPurpose.SeatReservation
            }, { actionStatus: factory.actionStatusType.CanceledActionStatus }, { new: true }).exec()
                .then((doc) => {
                if (doc === null) {
                    throw new factory.errors.NotFound('authorizeAction');
                }
                return doc.toObject();
            });
        });
    }
    findSeatReservationByTransactionId(transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.actionModel.findOne({
                'object.transactionId': transactionId,
                'purpose.typeOf': factory.action.authorize.authorizeActionPurpose.SeatReservation,
                typeOf: factory.actionType.AuthorizeAction,
                actionStatus: factory.actionStatusType.CompletedActionStatus
            }).exec().then((doc) => {
                if (doc === null) {
                    throw new factory.errors.NotFound('seatReservation authorizeAction');
                }
                return doc.toObject();
            });
        });
    }
    giveUp(actionId, error) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.actionModel.findByIdAndUpdate(actionId, {
                actionStatus: factory.actionStatusType.FailedActionStatus,
                error: error,
                endDate: new Date()
            }, { new: true }).exec().then((doc) => {
                if (doc === null) {
                    throw new factory.errors.NotFound('authorizeAction');
                }
                return doc.toObject();
            });
        });
    }
    findByTransactionId(transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.actionModel.find({
                'object.transactionId': transactionId,
                typeOf: factory.actionType.AuthorizeAction
            }).exec().then((docs) => docs.map((doc) => doc.toObject()));
        });
    }
}
exports.MongoRepository = MongoRepository;
