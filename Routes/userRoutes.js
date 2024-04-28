const express = require("express");
const {allUsers , registerUser , authVoter , resetPassword , verifyBeforePasswordUpdate} = require('../Controllers/userControllers');

const router = express.Router();

router.get("/getUsers", allUsers);
router.get("/verifyBeforePasswordUpdate", verifyBeforePasswordUpdate);
router.post("/registerUser", registerUser);
router.post("/authVoter", authVoter);
router.put("/resetPassword", resetPassword);

module.exports = router;