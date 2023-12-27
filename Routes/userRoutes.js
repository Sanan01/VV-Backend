const express = require("express");
const {allUsers , searchUser} = require('../Controllers/userControllers');

const router = express.Router();

router.get("/getUsers", allUsers);
router.get("/searchUser", searchUser);

module.exports = router;