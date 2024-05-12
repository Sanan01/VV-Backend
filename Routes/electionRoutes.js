const express = require("express");
const { protect } = require("../Middleware/authMiddleware");

const {registerElection , allElections , getElections , toggleElectionStatus , deleteElection , addPartyToElection , removePartyFromElection} = require('../Controllers/electionControllers');

const router = express.Router();

router.route("/").post(registerElection);
router.get("/getElections",getElections);
router.put("/toggleElectionStatus",toggleElectionStatus);
router.put("/deleteElection",deleteElection);
router.put("/addPartyToElection",addPartyToElection);
router.put("/removePartyFromELection",removePartyFromElection);



module.exports = router;