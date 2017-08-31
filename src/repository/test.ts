/**
 * test repository
 *
 * @class TestRepository
 */
export default class TestRepository {
    public readonly connection: string;

    constructor(connection: string) {
        this.connection = connection;
    }

    public getConnection() {
        return this.connection;
    }
}
