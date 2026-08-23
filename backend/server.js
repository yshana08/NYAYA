// App bootstrap only — middleware, static site, mount the API, start listening.
// All actual logic lives under src/ (see backend/README.md for the module map).
const express = require("express");
const cors = require("cors");
const { PORT, SITE_ROOT } = require("./src/config");
const anthropic = require("./src/anthropicClient");
const apiRoutes = require("./src/routes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Serve the real front end as-is (index.html, dashboard.html, css/, js/, ...).
app.use(express.static(SITE_ROOT));

app.use("/api", apiRoutes);

const server = app.listen(PORT, () => {
  console.log("");
  console.log("======================================");
  console.log("        NYAYA — GIG WORKER ASSISTANT");
  console.log("======================================");
  console.log("");
  console.log(`Website: http://localhost:${PORT}`);
  console.log(`Health:  http://localhost:${PORT}/api/health`);
  console.log("");
  console.log("Claude classification:", anthropic ? "CONFIGURED" : "NOT CONFIGURED — using offline matcher");
  console.log("");
  console.log("======================================");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\nPort ${PORT} is already in use — another process is using it.`);
    console.error(`Set a different PORT in backend/.env, or stop whatever's already running on ${PORT}.\n`);
    process.exit(1);
  }
  throw err;
});
