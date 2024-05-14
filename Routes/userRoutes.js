const express = require("express");
const {allUsers , registerUser , authVoter  , alternateLoginOfHandImage , sendOTPForAuth , verifyHandImage} = require('../Controllers/userControllers');

const router = express.Router();

router.get("/getUsers", allUsers);
router.post("/alternateLoginOfHandImage", alternateLoginOfHandImage);
router.post("/registerUser", registerUser);
router.post("/authVoter", authVoter);
router.put("/sendOTPForAuth",sendOTPForAuth);
router.get("/verifyHandImage",verifyHandImage);

module.exports = router;