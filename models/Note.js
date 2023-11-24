// a notebook schema
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var NotebookSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  owner: String,
  tag: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notebook", NotebookSchema);
