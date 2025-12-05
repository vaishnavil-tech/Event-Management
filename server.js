const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const usersFile = path.join(__dirname, "data", "users.json");
const eventsFile = path.join(__dirname, "data", "events.json");

function readData(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file));
}

function writeData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

app.get("/", (req, res) => res.send("Local backend running"));

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, phone } = req.body;
  let users = readData(usersFile);

  if (users.find(u => u.email === email))
    return res.status(400).json({ error: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);

  users.push({ name, email, password: hashed, phone });
  writeData(usersFile, users);

  res.json({ message: "User registered successfully!" });
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const users = readData(usersFile);
  const user = users.find(u => u.email === email);

  if (!user) return res.status(400).json({ error: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Incorrect password" });

  res.json({ message: "Login successful", user });
});

// BOOK EVENT
app.post("/api/events", (req, res) => {
  const { eventName, clientName, eventDate, eventLocation } = req.body;

  let events = readData(eventsFile);
  events.push({ eventName, clientName, eventDate, eventLocation });

  writeData(eventsFile, events);

  res.json({ message: "Event booked successfully!" });
});

app.get("/api/events", (req, res) => {
  res.json(readData(eventsFile));
});

app.listen(PORT, () =>
  console.log(`Backend running on port ${PORT}`)
);

// ADMIN - GET ALL USERS
app.get("/api/admin/users", (req, res) => {
  const users = readData(usersFile);
  res.json(users);
});

// ADMIN - GET ALL EVENTS
app.get("/api/admin/events", (req, res) => {
  const events = readData(eventsFile);
  res.json(events);
});
