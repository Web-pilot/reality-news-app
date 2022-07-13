// MIDDLEWARE
const { verifyTokenAndAdmin } = require("../middleware/tokenVerification");
const isUserAuthenticated = require("../middleware/isUserLoggedIn");
const upload = require("../uploadImage");
// DATABASE
const Pool = require("../db");
//HELPER FUNCTION
const checkIfItemExist = require("../middleware/userExist");
// EXPRESS ROUTE
const router = require("express").Router();

// CREATE NEWS
router.post(
  "/create",
  isUserAuthenticated,
  upload.single("img"),
  async (req, res) => {
    try {
      const { title, headline, description, img, category } = req.body;
      const userId = req.user.userid;
      const news = await Pool.query(
        "INSERT INTO news (title, headline, description, img, category, date, userid) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [
          title,
          headline,
          description,
          img,
          category,
          new Date().toDateString(),
          userId,
        ]
      );
      res.redirect("/news/details/" + news.rows[0].newsid);
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);

//EDIT NEWS
router.post(
  "/edit/:id",
  isUserAuthenticated,
  upload.single("img"),
  async (req, res) => {
    try {
      const { id } = req.params;

      let { title, headline, description, img, category } = req.body;
      const news = await Pool.query("SELECT * FROM news WHERE newsid = $1", [
        id,
      ]);
      if (!news.rows[0]) {
        res.status(404).json("Not found");
      } else {
        const item = await Pool.query("SELECT * FROM news WHERE newsid = $1", [
          id,
        ]);
        if (item.rows[0].userid !== req.user.userid || !req.user.isadmin) {
          res.status(403).json("You are not the owner of this item");
        } else {
          if (!img) {
            img = news.rows[0].img;
          }
          const updatedNews = await Pool.query(
            "UPDATE news SET (title, headline, description, img, category) = ($1, $2, $3, $4, $5) WHERE newsid = $6 RETURNING *",
            [title, headline, description, img, category, id]
          );
          //  res.status(200).json(updatedNews.rows[0]);
          res.redirect("/news/details/" + updatedNews.rows[0].newsid);
        }
      }
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);

//GET LATEST NEWS
router.get("/latest", async (req, res) => {
  try {
    const latestNews = await Pool.query(
      "SELECT * FROM news ORDER BY newsid DESC limit(6)"
    );
    res.status(200).json(latestNews.rows);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// GET ALL NEWS
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    if (category) {
      const data = await Pool.query("SELECT * FROM news WHERE category = $1", [
        category,
      ]);
      res.status(200).json(data.rows);
    } else {
      const data = await Pool.query("SELECT * FROM news");
      res.status(200).json(data.rows);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// GET NEWS BY ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const newsExist = checkIfItemExist(id);
    if (!newsExist) {
      res.status(404).json("Not found");
    } else {
      const news = await Pool.query("SELECT * FROM news WHERE newsid = $1", [
        id,
      ]);
      res.status(200).json(news.rows[0]);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// DELETE NEWS BY ID
router.delete(
  "/delete/:id",
  isUserAuthenticated,
  verifyTokenAndAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const newsExist = checkIfItemExist(id);
      if (!newsExist) {
        res.status(404).json("Not found");
      } else {
        const item = await Pool.query("SELECT * FROM news WHERE newsid = $1", [
          id,
        ]);

        await Pool.query("DELETE FROM news WHERE newsid = $1", [id]);
        res.status(200).json("News deleted successfully");
      }
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);

// EXPORTS MY ROUTE
module.exports = router;
