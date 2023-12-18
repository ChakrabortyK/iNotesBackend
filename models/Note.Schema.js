// a notebook schema
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var NotebookSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  tag: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notebook", NotebookSchema);
