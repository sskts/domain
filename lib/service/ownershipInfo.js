"use strict";
/**
 * ownershipInfo service
 * @namespace service.ownershipInfo
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
/**
 * 注文取引結果から所有権を作成する
 * @export
 * @function
 * @memberof service.ownershipInfo
 */
function createFromTransaction(transactionId) {
    return (ownershipInfoRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderById(transactionId);
        if (transaction.result !== undefined) {
            yield Promise.all(transaction.result.ownershipInfos.map((ownershipInfo) => __awaiter(this, void 0, void 0, function* () {
                yield ownershipInfoRepository.save(ownershipInfo);
            })));
        }
    });
}
exports.createFromTransaction = createFromTransaction;
