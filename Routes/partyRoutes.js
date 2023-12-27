const express = require("express");
const { protect } = require("../Middleware/authMiddleware");

const {registerParty , allParty,getParty , deleteParty} = require('../Controllers/partyConrollers');

const router = express.Router();

router.route("/").post(registerParty).get(protect,allParty);
router.get("/getParty", getParty);
router.put("/deleteParty", deleteParty);

module.exports = router;