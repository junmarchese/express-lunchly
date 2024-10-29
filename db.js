/** Database for lunchly */
require("dotenv").config();
const { process_params } = require("express/lib/router");
const { Client } = require("pg");
const { connectionString } = require("pg/lib/defaults");

const db = new Client({
    connectionString: process.env.DATABASE_URL
});

db.connect();

module.exports = db;
