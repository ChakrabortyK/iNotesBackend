const express = require("express");
const mongo = require("./db/db");
const PORT = 3000;

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/notes", require("./routes/notes"));

mongo.on("error", (error) => console.error(error));
mongo.once("open", () => console.log("db connection successful"));

app.listen(PORT, () =>
  console.log(`Example app listening on http://localhost:${PORT}`)
);
