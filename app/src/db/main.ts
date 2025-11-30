// load env variables from the .env file
require('dotenv').config();

const { Pool } = require("pg");
/*
A pool connection to PostgreSQL is made, for the
purpose of running queries.
*/
export const pool = new Pool({
  user: "postgres",        // your postgres username
  host: "localhost",
  database: process.env.database_name,      // your database name which is stored in the .env file
  password: process.env.database_password, // database password stored in .env file for security reasons
  port: 5432, // default port
})