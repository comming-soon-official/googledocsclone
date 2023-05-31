const { Schema, model } = require("mongoose");

//creating simple Schema
const SchemaDB = new Schema({
  _id: String,
  data: Object,
});

module.exports = model("SchemaDB", SchemaDB);
