const mongoose = require("mongoose");
const url = process.env.MONGODB_URI;
console.log("connecting to", url);

mongoose.set("strictQuery", false);
mongoose
  .connect(url)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
  },
  number: {
    type: String,
    required: true,
    minlength: 8, // Ensure the number is at least 8 characters
    validate: {
      validator: function (v) {
        // Custom validator for the phone number format
        return /^[0-9]{2,3}-[0-9]{7,10}$/.test(v); // Checks for "xx-xxxxxxxxx" or "xxx-xxxxxxxxx"
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
