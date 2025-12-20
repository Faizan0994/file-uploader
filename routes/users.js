const { Router } = require("express");
const controller = require("../controllers/users-controller");

const router = new Router();

router.get("/", (req, res) => {
  // Go to dashboard by default
  if (req.user) res.redirect("/users/dashboard");
  else res.redirect("/auth");
});

router.get("/dashboard", controller.dashboardGet);

router.get("/dashboard/:path", controller.dashboardPathGet);

router.get("/upload", controller.uploadGet);

router.post("/upload", controller.uploadPost);

router.post("/dashboard/:path/deleteFolder", controller.deleteFolderPost);

router.post("/dashboard/:path/createFolder", controller.createFolderPost);

router.post("/dashboard/:path/renameFolder", controller.renameFolderPost);

module.exports = router;
