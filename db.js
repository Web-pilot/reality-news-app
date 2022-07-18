const Pool = require("pg").Pool;

const devConfig = {
  connectionString: `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}/${process.env.PG_DATABASE}`,
};

const proConfig = {
  connectionString: process.env.DATABASE_URL,
};

const pool = new Pool(proConfig);

module.exports = pool;
