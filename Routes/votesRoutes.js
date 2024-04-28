const express = require("express");
const { protect } = require("../Middleware/authMiddleware");

const {} = require('../Controllers/votesControllers');

const {addVoteForElection , getAllVotesByParty , getAllVotesByCandidate , calculateVotesByParty } = require('../Controllers/votesControllers');

const router = express.Router();

router.put("/addVoteForParty" , addVoteForElection);
router.get("/getAllVotesByParty" , getAllVotesByParty);
router.get("/getAllVotesByCandidate" , getAllVotesByCandidate);
router.get("/calculateVotesByParty" , calculateVotesByParty);
module.exports = router;