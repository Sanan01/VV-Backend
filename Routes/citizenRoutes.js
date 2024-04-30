const express = require("express");
const { protect } = require("../Middleware/authMiddleware");

const {registerCitizen , allCitizen , getCitizenCnicVerified} = require('../Controllers/citizenController');

const router = express.Router();

router.route("/").post(registerCitizen).get(allCitizen);
router.get("/getCitizenCnicVerified/:cnic", getCitizenCnicVerified);

module.exports = router;