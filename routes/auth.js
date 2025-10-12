const { Router } = require("express");
const controller = require("../controllers/auth-controller");

const router = new Router();

router.get("/", (req, res) => {
  // default auth route
  res.redirect("/auth/login");
});

router.get("/login", controller.loginGet);
router.get("/signup", controller.signupGet);
router.post("/login", controller.loginPost);
router.post("/signup", controller.signupPost);

module.exports = router;
