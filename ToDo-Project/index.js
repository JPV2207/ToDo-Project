import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

// Initialize the Express app and set the port
const app = express();


// Load environment variables from .env file
dotenv.config();

// Create a new PostgreSQL client with credentials from environment variables
const db = new pg.Client({
  user: process.env.USER, // Database user
  host: process.env.HOST, // Database host (usually 'localhost')
  database: process.env.DATABASE, // Database name
  password: process.env.PASSWORD, // Database password
  port: process.env.DB_PORT, // Database port (usually 5432)
});

// Connect to the PostgreSQL database
db.connect();

// Middleware to parse the request body and serve static files
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Initialize the items array as empty
let items = [];

// Route for the homepage to display the to-do list
app.get("/", async (req, res) => {
  try {
    // Query the database to get all items ordered by ID
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
    items = result.rows; // Store the query result in the items array

    // Render the "index.ejs" template with the list of items
    res.render("index.ejs", {
      listTitle: "Today", // Title of the list
      listItems: items, // Items to be displayed in the list
    });
  } catch (err) {
    // Log any errors during the database query
    console.log(err);
  }
});

// Route to add a new item to the to-do list
app.post("/add", async (req, res) => {
  const item = req.body.newItem; // Get the new item from the form

  try {
    // Insert the new item into the "items" table in the database
    await db.query("INSERT INTO items (title) VALUES ($1)", [item]);
    // Redirect to the homepage to show the updated list
    res.redirect("/");
  } catch (err) {
    // Log any errors during the database query
    console.log(err);
  }
});

// Route to edit an existing item in the to-do list
app.post("/edit", async (req, res) => {
  const item = req.body.updatedItemTitle; // The updated title for the item
  const id = req.body.updatedItemId; // The ID of the item to be updated

  try {
    // Update the title of the item in the database based on its ID
    await db.query("UPDATE items SET title = ($1) WHERE id = $2", [item, id]);
    // Redirect to the homepage to show the updated list
    res.redirect("/");
  } catch (err) {
    // Log any errors during the database query
    console.log(err);
  }
});

// Route to delete an item from the to-do list
app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId; // The ID of the item to be deleted

  try {
    // Delete the item from the database based on its ID
    await db.query("DELETE FROM items WHERE id = $1", [id]);
    // Redirect to the homepage to show the updated list
    res.redirect("/");
  } catch (err) {
    // Log any errors during the database query
    console.log(err);
  }
});

// Start the server and listen on the specified port
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
