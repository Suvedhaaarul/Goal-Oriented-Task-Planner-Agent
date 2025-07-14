// server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const { plannerAgent } = require("./planner");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/schedule-tasks", async (req, res) => {
  const tasks = req.body.tasks;
  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ error: "Expected 'tasks' as an array" });
  }

  try {
    const result = await plannerAgent(tasks); // pass tasks to agent
    return res.json(result); // return scheduling decisions + reasoning
  } catch (err) {
    console.error("Error scheduling tasks:", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
