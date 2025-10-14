const { Router } = require("express");
const controller = require("../controllers/users-controller");

const router = new Router();

router.get("/", (req, res) => {
  // Go to dashboard by default
  if (req.user) res.redirect("/users/dashboard");
  else res.redirect("/auth");
});

router.get("/dashboard", controller.dashboardGet);

module.exports = router;
