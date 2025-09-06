// migrar.js
require("dotenv").config();
const { syncDatabase } = require("./src/config");

syncDatabase();
