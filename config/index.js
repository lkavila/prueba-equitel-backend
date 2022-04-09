const dotenv = require("dotenv");

dotenv.config();

const config = {
  http: {
    host: process.env.HTTP_HOST || "0.0.0.0",
    port: process.env.PORT || process.env.HTTP_PORT,
  },
  jwtKey: process.env.JWTKEY,
  database: {
    connectionString: process.env.DB_CONNECTION_STRING,
  },
  saltRounds: parseInt(process.env.SALT_ROUNDS, 10),
};

module.exports = { config };
