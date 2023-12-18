const express = require("express");
const cors = require("cors");
const mongo = require("./db/db");
const PORT = 5000;

const app = express();
app.use(express.json());
app.use(cors());

app.get("/test", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/notes", require("./routes/notes.Route"));
app.use("/api/auth", require("./routes/auth.Route"));

mongo.on("error", (error) => console.error(error));
mongo.once("open", () => console.log("db connection successful"));

app.listen(PORT, () =>
  console.log(`Example app listening on http://localhost:${PORT}`)
);
