// console.log(process.env);
const express = require("express");
// const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const port = process.env.PORT || 8000;

const app = express();
app.use(express.json());
// app.use(cors());

app.get("/test", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/notes", require("./routes/notes.Route"));
app.use("/api/auth", require("./routes/auth.Route"));

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", (open) => console.log("Connected to database"));

app.listen(port, () =>
  console.log(`Example app listening on http://localhost:${port}`)
);
