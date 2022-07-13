// MIDDLEWARE
const { verifyTokenAndAdmin } = require("../middleware/tokenVerification");
const isUserAuthenticated = require("../middleware/isUserLoggedIn");
// DATABASE
const Pool = require("../db");
// EXPRESS ROUTE
const router = require("express").Router();

// CREATE CATEGORY
router.post(
  "/create",
  isUserAuthenticated,
  verifyTokenAndAdmin,
  async (req, res) => {
    try {
      const { title } = req.body;
      const item = await Pool.query(
        "INSERT INTO category (title) VALUES($1) RETURNING *",
        [title]
      );
      res.redirect("/dashboard/categories");
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);

// EDIT CATEGORY
router.post(
  "/edit/:id",
  isUserAuthenticated,
  verifyTokenAndAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const category = await Pool.query(
        "SELECT * FROM category WHERE categoryid = $1",
        [id]
      );
      if (!category.rows[0]) {
        res.status(404).json("Not found");
      } else {
        const updatedUser = await Pool.query(
          "UPDATE category SET title = $1 WHERE categoryid = $2 RETURNING *",
          [title, id]
        );

        res.redirect("/dashboard/categories");
      }
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);

// GET CATEGORY
router.get("/", async (req, res) => {
  try {
    const category = await Pool.query("SELECT * FROM category");
    res.status(200).json(category.rows);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// GET CATEGORY BY ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Pool.query(
      "SELECT * category WHERE categoryid = $1",
      [id]
    );
    if (!category.rows[0]) {
      res.status(404).json("Not found");
    } else {
      const category = await Pool.query(
        "SELECT * FROM category WHERE categoryid = $1",
        [id]
      );
      res.status(200).json(category.rows[0]);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// DELETE CATEGORY
router.delete(
  "/delete/:id",
  isUserAuthenticated,
  verifyTokenAndAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Pool.query(
        "SELECT * FROM category WHERE categoryid = $1",
        [id]
      );
      if (!category.rows[0]) {
        res.status(404).json("Not found");
      } else {
        await Pool.query("DELETE FROM category WHERE categoryid = $1", [id]);
        res.status(200).json("Category deleted successfully");
      }
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);

// EXPORTS ROUTES
module.exports = router;
