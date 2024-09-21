const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
  },
  favoriteGenre: { type: String, minlength: 3, default: "none" },
});

module.exports = mongoose.model("User", schema);
