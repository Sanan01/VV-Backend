const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const partySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  abbreviation: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  symbol: {
    type: String,
    required: true,
    trim: true,
    default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
  },
  leader: {
    type: String,
    required: true,
    trim: true,
  },
  foundingDate: {
    type: Date,
    required: true,
  },
  ideology: {
    type: String,
    required: true,
    trim: true,
  },
  manifesto: {
    type: String,
    required: true,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
});

const Party = mongoose.model("Party", partySchema , "Parties", { database: "Voting-System" });

module.exports = Party;
