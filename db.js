const Pool = require("pg").Pool;

const devConfig = {
  connectionString: `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}/${process.env.PG_DATABASE}`,
};
let pool;
const proConfig = {
  connectionString: process.env.DATABASE_URL,
};

if (process.env.NODE_ENV === "production") {
  pool = new Pool(proConfig);
} else {
  pool = new Pool(devConfig);
}
module.exports = pool;
