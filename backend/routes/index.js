var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json({
    success: true,
    message: "School Health Management System API",
    version: "1.0.0",
    documentation: "/api-docs",
  });
});

module.exports = router;
