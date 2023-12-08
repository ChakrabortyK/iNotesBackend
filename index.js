const express = require("express");
const mongo = require("./db/db");
const PORT = 3001;

const app = express();
app.use(express.json());

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
