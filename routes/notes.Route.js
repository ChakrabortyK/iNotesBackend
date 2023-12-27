//create notes route
const express = require("express");
const router = express.Router();
const { validationResult, body } = require("express-validator");

//MODEL
const Notes = require("../models/Note.Schema");
//MIDDLEWARE
const fetchUser = require("../middlewares/fetchUser.middleware");
//ARRAY OF VALIDATION
const arrayVal = [
  body("description")
    .isLength({ min: 5, max: 100 })
    .withMessage("Desc should be atleast 5 characters long"),
  body("title")
    .isLength({ min: 5 })
    .withMessage("title must be at least 5 characters long"),
  body("tag").optional(),
];

router.get("/", (req, res) => {
  res.json({ success: true, message: "Notes Route" });
});

router.get("/allnotes", async (req, res) => {
  try {
    const notes = await Notes.find({});
    if (notes) {
      res.status(200).json({ success: true, notes });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "No notes found" });
    }
  } catch (error) {}
});

router.get("/allnotesjwt", fetchUser, async (req, res) => {
  userId = req.user.id;
  try {
    const notes = await Notes.find({ user: userId });
    if (!notes) {
      return res
        .status(200)
        .json({ success: false, message: "No notes found" });
    }
    res.status(200).json({ success: true, notes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error in Finding notes" });
  }
});

router.post("/new", arrayVal, fetchUser, async (req, res) => {
  //validationResult = Extracts the validation errors of an express request
  const result = validationResult(req);
  const result2 = result.formatWith((error) => error.msg);

  if (!result2.isEmpty()) {
    return res
      .status(400)
      .json({ success: false, errors: result2.array(), body: req.body });
  }

  try {
    const { title, description, tag } = req.body;
    const note = await Notes.create({
      title,
      description,
      user: req.user.id,
      tag,
    });

    try {
      res.status(201).json({ success: true, note: note });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Error in creating new Note" });
    }
  } catch (error) {
    console.error(error);
  }
});

router.put("/update/:noteId", fetchUser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;

    // console.log(req.params.noteId);
    const note = await Notes.findById(req.params.noteId);
    const updatedNote = {};

    if (title) {
      updatedNote.title = title;
    }
    if (description) {
      updatedNote.description = description;
    }
    if (tag) {
      updatedNote.tag = tag;
    }

    if (Object.keys(updatedNote).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one valid update",
      });
    }

    if (req.user.id !== note.user.toString()) {
      return res.status(401).json({
        success: false,
        message: "You can only update your own notes",
      });
    }

    noteUpdateResult = await Notes.findByIdAndUpdate(
      req.params.noteId,
      updatedNote,
      { new: true }
    );
    res.status(201).json({ success: true, noteUpdateResult });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error in creating new Note" });
  }
});

router.delete("/delete/:noteId", fetchUser, async (req, res) => {
  try {
    const note = await Notes.findById(req.params.noteId);
    if (req.user.id !== note.user.toString()) {
      return res.status(401).json({
        success: false,
        message: "You can only delete your own notes",
      });
    }

    if (!note) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });
    }
    noteDeleteResult = await Notes.findByIdAndDelete(req.params.noteId);
    res.status(200).json({ success: true, noteDeleteResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error in deleting note" });
  }
});

module.exports = router;
