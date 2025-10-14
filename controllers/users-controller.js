const express = require("express");

exports.dashboardGet = (req, res) => {
  let user = req.user;
  if (user) {
    res.render("dashboard", { name: user.name });
  } else {
    res.redirect("/auth");
  }
};
