const asyncHandler = require('express-async-handler');
const Election = require("../Models/ElectionModel");

const addVoteForElection = asyncHandler(async (req, res) => {
    console.log("Add Vote Election Status API");
    const { electionId, partyId, candidateId } = req.body;
    
    try {
        const election = await Election.findOne({ _id: electionId });

        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        if (!election.isActive) {
            return res.status(400).json({ message: 'Cannot add vote, election status not active' });
        }

        const isPartyValid = election.parties.some(party => party.party.toString() === partyId);

        if (!isPartyValid) {
            return res.status(400).json({ message: 'Invalid partyId' });
        }
        
        const party = election.parties.find(party => party.party.toString() === partyId);

        if (!party.candidates.includes(candidateId)) {
            return res.status(400).json({ message: 'Invalid candidateId for the specified party' });
        }

        let result = election.results.find(result =>
            result.party.toString() === partyId && result.candidate.toString() === candidateId
        );

        if (!result) {
            result = {
                party: partyId,
                candidate: candidateId,
                votes: 1
            };
            election.results.push(result);
        } else {
            result.votes += 1;
        }

        await election.save();

        return res.status(200).json({ message: 'Vote added successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


const getAllVotesByParty = asyncHandler(async (req, res) => {
    console.log("Get Vote by Party Election Status API");
    const { electionId, partyId } = req.body;
    
    try {
        const election = await Election.findOne({ _id: electionId });

        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        const partyVotes = election.results.filter(result => result.party.toString() === partyId);
        const countPartyVotes = partyVotes.reduce((acc, result) => acc + result.votes, 0);
        console.log(countPartyVotes)
        
        return res.status(200).json({ votes: countPartyVotes });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

const getAllVotesByCandidate = asyncHandler(async (req, res) => {
    console.log("Get Vote by Candidate Election Status API");
    const { electionId, candidateId, partyId } = req.body;
    
    try {
        const election = await Election.findOne({ _id: electionId });

        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        const candidateVotes = election.results.filter(result => result.candidate.toString() === candidateId && result.party.toString() === partyId);

        const votesByCandidate = candidateVotes.reduce((acc, result) => acc + result.votes, 0);

        return res.status(200).json({ votes: votesByCandidate });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

const calculateVotesByParty = asyncHandler(async (req, res) => {
    try {
        const { electionId } = req.body;

        const election = await Election.findOne({ _id: electionId }).populate('parties.party');

        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        const votesByParty = {};

        election.results.forEach(result => {
            const partyId = result.party.toString();
            const votes = result.votes;

            if (votesByParty[partyId]) {
                votesByParty[partyId].votes += votes;
            } else {
                const party = election.parties.find(p => p.party._id.toString() === partyId);
                const partyName = party ? party.party.name : 'Unknown Party';
                const abbreviation = party ? party.party.abbreviation : 'Unknown Abbreviation';
                votesByParty[partyId] = { partyName, abbreviation, votes };
            }
        });

        const votesArray = Object.values(votesByParty);

        return res.status(200).json(votesArray);
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = { addVoteForElection, getAllVotesByParty, getAllVotesByCandidate , calculateVotesByParty };
