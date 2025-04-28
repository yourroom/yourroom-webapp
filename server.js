require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs"); // Import fs module
const mainRoutes = require("./routes/index");
const db = require("./config/db"); // Import db config

const app = express();
const PORT = process.env.PORT || 3000;

// Function to initialize database
async function initializeDatabase() {
  try {
    console.log("Checking if database initialization is needed...");
    // Check if a key table (e.g., users) exists
    await db.query("SELECT 1 FROM users LIMIT 1");
    console.log("Database already initialized.");
  } catch (error) {
    // If the table doesn't exist (error code 42P01 for undefined_table)
    if (error.code === "42P01") {
      console.log("Database not initialized. Running setup script...");
      try {
        const setupSql = fs.readFileSync(path.join(__dirname, "setup.sql"), "utf8");
        await db.query(setupSql);
        console.log("Database initialized successfully.");
      } catch (initError) {
        console.error("Error initializing database:", initError);
        // Exit process if initialization fails, as the app likely won't work
        process.exit(1);
      }
    } else {
      // Log other potential connection errors
      console.error("Error checking database status:", error);
      process.exit(1);
    }
  }
}

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/", mainRoutes);

// Basic Error Handling (can be expanded)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start Server only after ensuring database is initialized
initializeDatabase().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
    console.error("Failed to initialize database or start server:", err);
    process.exit(1);
});

