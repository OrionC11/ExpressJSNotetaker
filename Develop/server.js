const express = require("express");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// HTML routes
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/notes.html"))
);
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

// API routes
app.get("/api/notes", (req, res) => {
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error reading notes" });
    }
    return res.json(JSON.parse(data));
  });
});

app.post("/api/notes", (req, res) => {
  const newNote = { ...req.body, id: uuidv4() };

  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error reading notes" });
    }

    const notes = JSON.parse(data);
    notes.push(newNote);

    fs.writeFile("./db/db.json", JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error writing note" });
      }
      return res.json(newNote);
    });
  });
});

app.delete("/api/notes/:id", (req, res) => {
  const { id } = req.params;

  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error reading notes" });
    }

    let notes = JSON.parse(data);
    notes = notes.filter((note) => note.id !== id);

    fs.writeFile("./db/db.json", JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error deleting note" });
      }
      return res.json({ message: "Note deleted" });
    });
  });
});

app.listen(PORT, () =>
  console.log(`Server listening on http://localhost:${PORT}`)
);
