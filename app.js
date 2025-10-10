const express = require("express");
const path = require("path");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");

const app = express();

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("index");
});

app.use("/auth", authRouter);
app.use("/users", usersRouter);

app.listen(PORT, (err) => {
  if (err) throw err;
  console.log("server listening....");
});
