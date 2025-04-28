const express = require("express");
const router = express.Router();
const User = require("../models/user"); // Import the User model
const Property = require("../models/property"); // Import the Property model

// Home page
router.get("/", async (req, res) => {
  try {
    // Fetch some recent properties for the home page (e.g., latest 6)
    const recentProperties = await Property.getAll(); // Assuming getAll sorts by newest first
    res.render("index", { 
      title: "YourRoom - Find Your Perfect PG/Hostel",
      properties: recentProperties.slice(0, 6) // Pass limited properties to the view
    });
  } catch (error) {
    console.error("Error fetching properties for home page:", error);
    res.render("index", { title: "YourRoom - Find Your Perfect PG/Hostel", properties: [] });
  }
});

// Registration choice page
router.get("/register", (req, res) => {
  res.render("register_choice", { title: "Register - YourRoom" });
});

// Show seeker registration form
router.get("/register/seeker", (req, res) => {
  res.render("register_seeker", { title: "Register as Seeker - YourRoom" });
});

// Show owner registration form
router.get("/register/owner", (req, res) => {
  res.render("register_owner", { title: "Register as Owner - YourRoom" });
});

// Handle seeker registration form submission (POST)
router.post("/register/seeker", async (req, res) => {
  try {
    const result = await User.create(req.body, "seeker");
    if (result.success) {
      // TODO: Redirect to a success page or login page
      res.send("Seeker registration successful! User ID: " + result.userId);
    } else {
      console.error("Seeker registration error:", result.error);
      res.status(500).send("Registration failed: " + result.error);
    }
  } catch (error) {
    console.error("Error in seeker registration route:", error);
    res.status(500).send("An unexpected error occurred during registration.");
  }
});

// Handle owner registration form submission (POST)
router.post("/register/owner", async (req, res) => {
  try {
    // TODO: Handle file uploads for photos and verification documents
    const result = await User.create(req.body, "owner");
    if (result.success) {
      // TODO: Redirect to a success page or owner dashboard
      res.send("Owner registration successful! User ID: " + result.userId);
    } else {
      console.error("Owner registration error:", result.error);
      res.status(500).send("Registration failed: " + result.error);
    }
  } catch (error) {
    console.error("Error in owner registration route:", error);
    res.status(500).send("An unexpected error occurred during registration.");
  }
});

// Show search page / handle search query
router.get("/search", async (req, res) => {
  try {
    const filters = req.query; // Get filters from query parameters
    const properties = await Property.search(filters);
    res.render("search_results", { 
      title: "Search Results - YourRoom", 
      properties: properties,
      filters: filters // Pass filters back to pre-fill the form
    });
  } catch (error) {
    console.error("Error during property search:", error);
    res.status(500).send("An error occurred during search.");
  }
});

// Show property details page
router.get("/property/:id", async (req, res) => {
  try {
    const propertyId = req.params.id;
    const property = await Property.getById(propertyId);
    if (property) {
      res.render("property_details", { 
        title: property.property_name + " - YourRoom", 
        property: property 
      });
    } else {
      res.status(404).send("Property not found");
    }
  } catch (error) {
    console.error("Error fetching property details:", error);
    res.status(500).send("An error occurred fetching property details.");
  }
});

module.exports = router;

