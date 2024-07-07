import mysqlNonPromise from "mysql2";
import mysqlPromise from "mysql2/promise";
import env from "./env";

const {
    MYSQL_HOST,
    MYSQL_USER,
    MYSQL_PASSWORD,
    MYSQL_DATABASE,
} = env.value;

class Database {
    nonPromise() {
        return mysqlNonPromise.createPool({
            host: MYSQL_HOST,
            user: MYSQL_USER,
            password: MYSQL_PASSWORD,
            database: MYSQL_DATABASE,
        });
    };
    promise() {
        return mysqlPromise.createPool({
            host: MYSQL_HOST,
            user: MYSQL_USER,
            password: MYSQL_PASSWORD,
            database: MYSQL_DATABASE,
        });
    };
};

export default new Database();