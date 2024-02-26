const express = require("express");
const {allUsers , registerUser , authVoter} = require('../Controllers/userControllers');

const router = express.Router();

router.get("/getUsers", allUsers);
router.post("/registerUser", registerUser);
router.post("/authVoter", authVoter);

module.exports = router;