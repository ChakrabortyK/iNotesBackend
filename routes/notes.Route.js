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
  body("name")
    .isLength({ min: 5 })
    .withMessage("Name must be at least 5 characters long"),
  body("description")
    .isLength({ min: 5, max: 100 })
    .withMessage("Desc should be atleast 5 characters long"),
  body("tag").optional(),
];

router.get("/", (req, res) => {
  res.send("Notes Route");
});

router.get("/allnotes", async (req, res) => {
  try {
    const notes = await Notes.find({});
    if (notes) {
      res.status(200).json(notes);
    } else {
      return res.status(404).json({ message: "No notes found" });
    }
  } catch (error) {}
});

router.get("/allnotesjwt", fetchUser, async (req, res) => {
  userId = req.user.id;
  try {
    const notes = await Notes.find({ user: userId });
    if (!notes) {
      return res.status(200).json({ message: "No notes found" });
    }
    res.status(200).json(notes);
  } catch (error) {
    console.error(error);
  }
});

router.post("/new", arrayVal, fetchUser, async (req, res) => {
  //validationResult = Extracts the validation errors of an express request
  const result = validationResult(req);
  const result2 = result.formatWith((error) => error.msg);

  if (!result2.isEmpty()) {
    return res.status(400).json({ errors: result2.array() });
  }

  try {
    const { name, description, tag } = req.body;
    const note = await Notes.create({
      name,
      description,
      user: req.user.id,
      tag,
    });

    try {
      res.status(201).json(note);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error in creating new Note" });
    }
  } catch (error) {
    console.error(error);
  }
});

router.put("/update/:noteId", fetchUser, async (req, res) => {
  try {
    const { name, description, tag } = req.body;

    // console.log(req.params.noteId);
    const note = await Notes.findById(req.params.noteId);
    const updatedNote = {};

    if (name) {
      updatedNote.name = name;
    }
    if (description) {
      updatedNote.description = description;
    }
    if (tag) {
      updatedNote.tag = tag;
    }

    if (Object.keys(updatedNote).length === 0) {
      return res
        .status(400)
        .json({ message: "Please provide at least one valid update" });
    }

    if (req.user.id !== note.user.toString()) {
      return res
        .status(401)
        .json({ message: "You can only update your own notes" });
    }

    noteUpdateResult = await Notes.findByIdAndUpdate(
      req.params.noteId,
      updatedNote,
      { new: true }
    );
    res.status(201).json(noteUpdateResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error in creating new Note" });
  }
});

router.delete("/delete/:noteId", fetchUser, async (req, res) => {
  try {
    const note = await Notes.findById(req.params.noteId);
    if (req.user.id !== note.user.toString()) {
      return res
        .status(401)
        .json({ message: "You can only delete your own notes" });
    }

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    noteDeleteResult = await Notes.findByIdAndDelete(req.params.noteId);
    res.status(200).json(noteDeleteResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error in deleting note" });
  }
});

module.exports = router;
