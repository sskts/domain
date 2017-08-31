"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * test repository
 *
 * @class TestRepository
 */
class TestRepository {
    constructor(connection) {
        this.connection = connection;
    }
    getConnection() {
        return this.connection;
    }
}
exports.default = TestRepository;
