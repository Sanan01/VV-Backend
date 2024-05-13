const jwt = require("jsonwebtoken");

const generateToken = () => {
  return Math.floor(Math.random() * 900000) + 100000;
};

module.exports = generateToken;
