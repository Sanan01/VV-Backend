const express = require("express");
const { protect } = require("../Middleware/authMiddleware");

const {registerCandidate , allCandidate , getCandidates , deleteCandidate , changeParty} = require('../Controllers/candidateControllers');

const router = express.Router();

router.route("/").post(registerCandidate).get(protect,allCandidate);
router.get("/getCandidates", getCandidates);
router.put("/deleteCandidate", deleteCandidate);
router.put("/changeParty", changeParty);


module.exports = router;