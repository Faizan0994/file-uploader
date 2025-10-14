const express = require("express");

exports.dashboardGet = (req, res) => {
  let user = req.user;
  if (user) {
    res.render("dashboard", { name: user.name });
  } else {
    res.redirect("/auth");
  }
};

exports.uploadGet = (req, res) => {
  if (!req.user) return res.redirect("/auth"); // Confirm the user is logged in

  res.render("upload");
};
