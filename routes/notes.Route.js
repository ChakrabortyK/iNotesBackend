//create notes route
const express = require("express");
const router = express.Router();
const notes = require("../models/Note.Schema");
router.get("/", (req, res) => {
  res.send("Notes Route");
});

module.exports = router;