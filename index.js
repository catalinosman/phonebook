require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
const Person = require("./models/person");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

// Morgan Logging
morgan.token("postData", (req) => JSON.stringify(req.body));
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :postData"
  )
);

//  Routes

app.get("/api", (req, res) => {
  res.send("<h1>Fullstack Helsinki Course</h1>");
});

// Get all persons from MongoDB
app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => res.json(persons));
});

// Get a single person by ID
app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

// Get phonebook info
app.get("/info", async (req, res) => {
  const numPersons = await Person.countDocuments({});
  res.send(
    `<p>Phonebook has info for ${numPersons} people</p><p>${new Date()}</p>`
  );
});

// Add a new person to MongoDB
const phoneRegex = /^[0-9]{2,3}-[0-9]{5,}$/; // Custom regex for validation

// POST route to add a new person
app.post("/api/persons", async (req, res) => {
  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({ error: "Name or number is missing" });
  }

  // Validate phone number format
  if (!phoneRegex.test(number)) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  try {
    const existingPerson = await Person.findOne({ name });
    if (existingPerson) {
      return res.status(400).json({ error: "Name must be unique" });
    }

    const person = new Person({ name, number });
    const savedPerson = await person.save();
    res.json(savedPerson);
  } catch (error) {
    console.error("Error adding person:", error); // Log the error
    res.status(500).json({ error: "Server error while adding person" }); // Send a generic error to the client
  }
});

app.put("/api/persons/:id", (req, res, next) => {
  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({ error: "Name or number is missing" });
  }

  // Validate phone number format
  if (!phoneRegex.test(number)) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  const updatedPerson = { name, number };

  Person.findByIdAndUpdate(req.params.id, updatedPerson, { new: true })
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).json({ error: "Person not found" });
      }
    })
    .catch((error) => next(error));
});
//  Delete a person by ID
app.delete("/api/persons/:id", async (req, res, next) => {
  try {
    const deletedPerson = await Person.findByIdAndDelete(req.params.id);
    if (!deletedPerson) {
      return res.status(404).json({ error: "Person not found" });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return res.status(400).json({ error: "Malformatted Id" });
  }

  next(error);
};

// Register error-handling middleware (must be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
