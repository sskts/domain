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
const action_1 = require("./mongoose/model/action");
/**
 * action repository
 * @class
 */
class MongoRepository {
    constructor(connection) {
        this.actionModel = connection.model(action_1.default.modelName);
    }
    printTicket(agentId, ticket) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const actionAttributes = factory.action.transfer.print.ticket.createAttributes({
                actionStatus: factory.actionStatusType.CompletedActionStatus,
                object: {
                    typeOf: 'Ticket',
                    ticketToken: ticket.ticketToken
                },
                agent: {
                    typeOf: 'Person',
                    id: agentId
                },
                startDate: now,
                endDate: now
            });
            return yield this.actionModel.create(actionAttributes).then((doc) => doc.toObject());
        });
    }
    searchPrintTicket(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.actionModel.find({
                typeOf: factory.actionType.PrintAction,
                'agent.id': conditions.agentId,
                'object.typeOf': 'Ticket',
                'object.ticketToken': conditions.ticketToken
            }).then((docs) => docs.map((doc) => doc.toObject()));
        });
    }
}
exports.MongoRepository = MongoRepository;
