import {Sequelize} from "sequelize";

const db = new Sequelize('vapestore_db', 'root', '', {
    host: "localhost",
    dialect: "mysql"
});

export default db;