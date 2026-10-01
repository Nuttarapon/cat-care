const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data", "cats.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

function readCats() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeCats(cats) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(cats, null, 2), "utf8");
}

// GET /api/cats?fed=true|false
app.get("/api/cats", (req, res) => {
  let cats = readCats();

  if (req.query.fed !== undefined) {
    if (req.query.fed !== "true" && req.query.fed !== "false") {
      return res.status(400).json({ error: "fed must be true or false" });
    }
    const fed = req.query.fed === "true";
    cats = cats.filter(cat => cat.fed === fed);
  }

  res.json(cats);
});

// GET /api/cats/:id
app.get("/api/cats/:id", (req, res) => {
  const id = Number(req.params.id);
  const cat = readCats().find(item => item.id === id);

  if (!cat) {
    return res.status(404).json({ error: "Cat not found" });
  }

  res.json(cat);
});

// POST /api/cats
app.post("/api/cats", (req, res) => {
  const { name, age, food, fed } = req.body;

  if (!name || age === undefined || !food || fed === undefined) {
    return res.status(400).json({
      error: "name, age, food and fed are required"
    });
  }

  if (typeof name !== "string" || typeof food !== "string" ||
      typeof age !== "number" || typeof fed !== "boolean" ||
      age < 0) {
    return res.status(400).json({ error: "Invalid data type or value" });
  }

  const cats = readCats();
  const newCat = {
    id: cats.length ? Math.max(...cats.map(cat => cat.id)) + 1 : 1,
    name: name.trim(),
    age,
    food: food.trim(),
    fed
  };

  cats.push(newCat);
  writeCats(cats);

  res.status(201).json(newCat);
});

// PATCH /api/cats/:id
app.patch("/api/cats/:id", (req, res) => {
  const id = Number(req.params.id);
  const cats = readCats();
  const index = cats.findIndex(cat => cat.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Cat not found" });
  }

  const allowed = ["name", "age", "food", "fed"];
  for (const key of Object.keys(req.body)) {
    if (!allowed.includes(key)) {
      return res.status(400).json({ error: `Invalid field: ${key}` });
    }
  }

  const updated = { ...cats[index], ...req.body };

  if (typeof updated.name !== "string" || !updated.name.trim() ||
      typeof updated.age !== "number" || updated.age < 0 ||
      typeof updated.food !== "string" || !updated.food.trim() ||
      typeof updated.fed !== "boolean") {
    return res.status(400).json({ error: "Invalid data" });
  }

  updated.name = updated.name.trim();
  updated.food = updated.food.trim();
  cats[index] = updated;
  writeCats(cats);

  res.json(updated);
});

// DELETE /api/cats/:id
app.delete("/api/cats/:id", (req, res) => {
  const id = Number(req.params.id);
  const cats = readCats();
  const index = cats.findIndex(cat => cat.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Cat not found" });
  }

  cats.splice(index, 1);
  writeCats(cats);

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`CatCare server running at http://localhost:${PORT}`);
});
