const Pool = require("../db");
const checkIfItemExist = async (id) => {
  const user = await Pool.query("SELECT * FROM users WHERE userid = $1", [id]);
  if (user.rows[0]) {
    return user.rows[0];
  } else {
    return false;
  }
};

module.exports = checkIfItemExist;
