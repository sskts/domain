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
const task_1 = require("./mongoose/model/task");
/**
 * タスク実行時のソート条件
 * @const
 */
const sortOrder4executionOfTasks = {
    numberOfTried: 1,
    runsAt: 1 // 実行予定日時の早さ優先
};
/**
 * タスクレポジトリー
 *
 * @class TaskRepository
 */
class MongoRepository {
    constructor(connection) {
        this.taskModel = connection.model(task_1.default.modelName);
    }
    save(task) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();
        });
    }
    executeOneByName(taskName) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.taskModel.findOneAndUpdate({
                status: factory.taskStatus.Ready,
                runsAt: { $lt: new Date() },
                name: taskName
            }, {
                status: factory.taskStatus.Running,
                lastTriedAt: new Date(),
                $inc: {
                    remainingNumberOfTries: -1,
                    numberOfTried: 1 // トライ回数増やす
                }
            }, { new: true }).sort(sortOrder4executionOfTasks).exec();
            // タスクがなければ終了
            if (doc === null) {
                throw new factory.errors.NotFound('executable task');
            }
            return doc.toObject();
        });
    }
    retry(lastTriedAt) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.taskModel.update({
                status: factory.taskStatus.Running,
                lastTriedAt: { $lt: lastTriedAt },
                remainingNumberOfTries: { $gt: 0 }
            }, {
                status: factory.taskStatus.Ready // 実行前に変更
            }, { multi: true }).exec();
        });
    }
}
exports.MongoRepository = MongoRepository;
