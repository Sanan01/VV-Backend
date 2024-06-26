const express = require("express");
const { protect } = require("../Middleware/authMiddleware");

const {} = require('../Controllers/votesControllers');

const {addVoteForElection , getAllVotesByParty , getAllVotesByCandidate , calculateVotesByParty , getHashValueByPartyCandidate } = require('../Controllers/votesControllers');

const router = express.Router();

router.put("/addVoteForParty" , addVoteForElection);
router.get("/getAllVotesByParty" , getAllVotesByParty);
router.post("/getAllVotesByCandidate" , getAllVotesByCandidate);
router.get("/calculateVotesByParty/:electionId" , calculateVotesByParty);
router.post("/getHashValueByPartyCandidate" , getHashValueByPartyCandidate);

module.exports = router;