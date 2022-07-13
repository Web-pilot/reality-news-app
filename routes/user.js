// DATABASE
const Pool = require("../db");
// MIDDLEWARE
const checkIfItemExist = require("../middleware/userExist");
const { verifyTokenAndAdmin } = require("../middleware/tokenVerification");
const isUserAuthenticated = require("../middleware/isUserLoggedIn");
const upload = require("../uploadImage");
// EXPRESS ROUTE
const router = require("express").Router();

//CHANGE PROFILE PICTURE
router.post(
  "/changeProfile/:id",
  isUserAuthenticated,
  upload.single("img"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { img } = req.body;
      const user = await Pool.query("SELECT * FROM users WHERE userid = $1", [
        id,
      ]);
      if (!user.rows[0]) {
        res.status(404).json("User not found");
      } else {
        if (user.rows[0].userid !== req.user.userid) {
          res.status(403).json("Item not yours");
        } else {
          await Pool.query(
            "UPDATE users SET profilepic = $1 WHERE userid = $2",
            [img, id]
          );
          res.redirect("/user/profile/" + req.user.userid);
        }
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

// EDIT USER DETAILS
router.post("/edit/:id", isUserAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const userid = req.user.userid;
    const { username, email, firstname, lastname, address, phone } = req.body;
    const user = await checkIfItemExist(id);
    if (!user) {
      res.status(404).json("Not found");
    } else {
      const isUserOwner = await Pool.query(
        "SELECT * FROM users WHERE userid = $1",
        [userid]
      );
      if (isUserOwner.rows[0].userid !== userid) {
        res.status(403).json("Item not yours");
      } else {
        const updatedUser = await Pool.query(
          "UPDATE users SET (firstname, lastname, email, username, address, phone) = ($1, $2, $3, $4, $5, $6) WHERE userid = $7 RETURNING *",
          [firstname, lastname, email, username, address, phone, id]
        );
        const { password, ...others } = updatedUser.rows[0];
        const { userid } = { ...others };
        res.redirect("/user/profile/" + userid);
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
});

//GET ALL USERS
router.get("/", async (req, res) => {
  try {
    const users = await Pool.query("SELECT * FROM users");
    res.status(200).json(users.rows);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

//GET USER BY ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userExist = checkIfItemExist(id);
    if (!userExist) {
      res.status(404).json("Not found");
    } else {
      const user = await Pool.query("SELECT * FROM users WHERE userid = $1", [
        id,
      ]);
      res.status(200).json(user.rows[0]);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// DELETE USER
router.delete(
  "/delete/:id",
  isUserAuthenticated,
  verifyTokenAndAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userExist = checkIfItemExist(id);
      if (!userExist) {
        res.status(404).json("Not found");
      } else {
        await Pool.query("DELETE FROM users WHERE userid = $1", [id]);
        res.status(200).json("User deleted successfully");
      }
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);

// EXPORTS ROUTE
module.exports = router;
