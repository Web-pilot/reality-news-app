const router = require("express").Router();
const Pool = require("../db");
const isUserAuthenticated = require("../middleware/isUserLoggedIn");
const { userIsLogin } = require("../middleware/Login");

// HOME PAGE
router.get("/", async (req, res) => {
  try {
    const latestNews = await Pool.query(
      "SELECT * FROM news ORDER BY newsid DESC limit(3)"
    );
    const news = await Pool.query("SELECT * FROM news");
    const users = await Pool.query("SELECT * FROM users");

    res.render("index.ejs", {
      data: latestNews.rows,
      user: req.user,
      total: { users: users.rowCount, news: news.rowCount },
      title: "Home",
    });
  } catch (error) {
    res.send("I love coding");
  }
});

// NEWS PAGE
router.get("/news", async (req, res) => {
  try {
    const news = await Pool.query(
      "SELECT * FROM news ORDER BY newsid DESC limit(6)"
    );
    res.render("news.ejs", { user: req.user, title: "News" });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

//EDIT NEWS PAGE
router.get("/news/edit/:id", isUserAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const itemToEdit = await Pool.query(
      "SELECT * FROM news WHERE newsid = $1",
      [id]
    );
    res.render("edit.ejs", {
      news: itemToEdit.rows[0],
      user: req.user,
      title: "Edit News",
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// NEWS DETAILS PAGE
router.get("/news/details/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Pool.query(
      "SELECT * FROM news JOIN users ON news.userid = users.userid WHERE newsid = $1",
      [id]
    );

    res.render("details.ejs", {
      news: item.rows[0],
      user: req.user,
      title: "News Details",
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// CREATE NEWS PAGE
router.get("/create-news", isUserAuthenticated, (req, res) => {
  res.render("create.ejs", { user: req.user, title: "News - Create" });
});

// MANAGE NEWS PAGE
router.get("/manage-news", isUserAuthenticated, async (req, res) => {
  try {
    const news = await Pool.query(
      "SELECT * FROM news WHERE news.userid = $1 ORDER BY newsid DESC",
      [req.user.userid]
    );
    res.render("manage.ejs", {
      data: news.rows,
      user: req.user,
      title: "Manage- News",
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// DASHBOARD
router.get("/dashboard", isUserAuthenticated, async (req, res) => {
  try {
    const fetchUsers = await Pool.query(
      "SELECT * FROM users ORDER BY userid DESC"
    );
    res.render("dashboard", {
      users: fetchUsers.rows,
      user: req.user,
      title: "Admin Dashboard",
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// DASHBOARD CATEGORIES PAGE
router.get("/dashboard/categories", isUserAuthenticated, async (req, res) => {
  try {
    const fetchCategories = await Pool.query("SELECT * FROM category");
    res.render("news-categories.ejs", {
      user: req.user,
      categories: fetchCategories.rows,
      title: "Dashboard - Categories",
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// DASHBOARD NEWS CATEGORY CREATE PAGE
router.get(
  "/dashboard/news-category/create",
  isUserAuthenticated,
  async (req, res) => {
    res.render("create-category.ejs", {
      user: req.user,
      title: "Create - category",
    });
  }
);

// DASHBOARD EDIT CATEGORY PAGE
router.get("/dashboard/categories/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const fetchCategory = await Pool.query(
      "SELECT * FROM category WHERE categoryid = $1",
      [id]
    );
    res.render("edit-category", {
      user: req.user,
      category: fetchCategory.rows[0],
      title: "Edit- News Category",
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// DASHBOARD NEWS PAGE
router.get("/dashboard/news", async (req, res) => {
  try {
    const allNews = await Pool.query("SELECT * FROM news");
    res.render("dashboard-news.ejs", {
      user: req.user,
      news: allNews.rows,
      title: "Dashboard - news",
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// USER DETAILS PAGE
router.get("/user/details/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const fetchUser = await Pool.query(
      "SELECT * FROM users WHERE userid = $1",
      [id]
    );
    res.render("userdetails.ejs", {
      user: req.user,
      userDetails: fetchUser.rows[0],
      title: `user ${id}`,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// ACCOUNT PAGE
router.get("/account", userIsLogin, async (req, res) => {
  res.render("account.ejs", { user: req.user, title: "Account" });
});

// FORGET PASSWORD PAGE
router.get("/account/forgetpassword", userIsLogin, async (req, res) => {
  res.render("forgetpassword", { title: "Forget password" });
});

// RESET PASSWORD PAGE
router.get("/account/resetpassword", userIsLogin, async (req, res) => {
  res.render("resetpassword.ejs", { title: "Reset password" });
});

// EMAIL SUCCESS PAGE
router.get("/emailsuccessmessage", userIsLogin, (req, res) => {
  res.render("emailsent.ejs", { title: "Email Success" });
});

// USER PROFILE PAGE
router.get("/user/profile/:id", isUserAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Pool.query("SELECT * FROM users WHERE userid = $1", [
      id,
    ]);
    req.user.username = user.rows[0].username;
    req.user.firstname = user.rows[0].firstname;
    req.user.lastname = user.rows[0].lastname;
    req.user.email = user.rows[0].email;
    req.user.address = user.rows[0].address;
    req.user.phone = user.rows[0].phone;
    req.user.profilepic = user.rows[0].profilepic;

    res.render("profile", {
      profile: req.user,
      user: req.user,
      title: "Profile",
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
