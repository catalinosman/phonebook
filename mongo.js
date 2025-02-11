require("dotenv").config();
const mongoose = require("mongoose");
const Person = require("./models/person");

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

if (!password) {
  console.log(
    "Please provide the password as an argument: node mongo.js <password>"
  );
  process.exit(1);
}

const url = process.env.MONGODB_URI;

// If only password is given, list all contacts
if (!name || !number) {
  Person.find({})
    .then((persons) => {
      console.log("Phonebook:");
      persons.forEach((person) => {
        console.log(`${person.name} ${person.number}`);
      });
      mongoose.connection.close();
    })
    .catch((err) => {
      console.error("Error fetching contacts:", err.message);
      mongoose.connection.close();
    });
} else {
  // Otherwise, add a new person to the phonebook
  const person = new Person({ name, number });

  person
    .save()
    .then(() => {
      console.log(`Added ${name} number ${number} to phonebook`);
      mongoose.connection.close();
    })
    .catch((err) => {
      console.error("Error saving contact:", err.message);
      mongoose.connection.close();
    });
}
