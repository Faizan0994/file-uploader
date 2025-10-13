const express = require("express");
const path = require("path");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const client = require("./database/client");
const passport = require("passport");
const passportInit = require("./config/passport-config");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 2 * 24 * 60 * 60 * 1000, // Two days
    },
    store: new PrismaSessionStore(client, {
      checkPeriod: 2 * 60 * 1000, // Two minutes
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

passportInit(passport); // Initialize passport as defined in config

app.get("/", (req, res) => {
  res.render("index");
});
app.use("/auth", authRouter);
app.use("/users", usersRouter);

app.listen(PORT, (err) => {
  if (err) throw err;
  console.log("server listening....");
});
