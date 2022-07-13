if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const flash = require("express-flash");
const Pool = require("./db");

//Routes

const authenticationRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const categoryRoute = require("./routes/category");
const generalRoute = require("./routes/generalRoute");
const newsRoute = require("./routes/news");

const app = express();
app.use(flash());
//passport
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    failureFlash: true,
  })
);
app.use(passport.session());

//middleware
app.use(cors());
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/images"));
const port = process.env.PORT || 5000;

//Routes
app.use("/api/authentication", authenticationRoute);
app.use("/api/user", userRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/news", newsRoute);
app.use("/", generalRoute);

app.get("*", async (req, res) => {
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
  res.render("index.ejs");
});
app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`);
});
