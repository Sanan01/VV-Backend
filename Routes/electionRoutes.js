const express = require("express");
const { protect } = require("../Middleware/authMiddleware");

const {registerElection , allElections , getElections , toggleElectionStatus , deleteElection} = require('../Controllers/electionControllers');

const router = express.Router();

router.route("/").post(registerElection).get(protect,allElections);
router.get("/getElections",getElections);
router.put("/toggleElectionStatus",toggleElectionStatus);
router.put("/deleteElection",deleteElection);

module.exports = router;