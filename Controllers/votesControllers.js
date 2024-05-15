const asyncHandler = require('express-async-handler');
const Election = require("../Models/ElectionModel");
const axios = require('axios');

// const addVoteForElection = asyncHandler(async (req, res) => {
//     console.log("Add Vote Election Status API");
//     const { electionId, partyId, candidateId, voterId, newHash } = req.body;
    
//     try {
//         const election = await Election.findOne({ _id: electionId });

//         if (!election) {
//             return res.status(404).json({ message: 'Election not found' });
//         }

//         if (!election.isActive) {
//             return res.status(400).json({ message: 'Cannot add vote, election status not active' });
//         }

//         const isPartyValid = election.parties.some(party => party.party.toString() === partyId);

//         if (!isPartyValid) {
//             return res.status(400).json({ message: 'Invalid partyId' });
//         }
        
//         const party = election.parties.find(party => party.party.toString() === partyId);

//         if (!party.candidates.includes(candidateId)) {
//             return res.status(400).json({ message: 'Invalid candidateId for the specified party' });
//         }

//         // Check if the voter has already voted in this election
//         if (election.voters.includes(voterId)) {
//             return res.status(400).json({ message: 'You have already voted in this election' });
//         } else {
//             // Update hasVoted status for the voter in this election
//             election.voters.push(voterId);
//         }

//         console.log("Election before modification:", JSON.stringify(election, null, 2));

//         // Increment vote count or add new candidate-party result
//         let result = election.results.find(result =>
//             result.party.toString() === partyId && result.candidate.toString() === candidateId
//         );

//         if (!result) {
//             // Candidate-party combination not found, create new result entry
//             result = {
//                 party: partyId,
//                 candidate: candidateId,
//                 votes: 1,
//                 latestIPFSHash: newHash,
//             };
//             election.results.push(result);
//         } else {
//             // Candidate-party combination found, increment vote count and update hash
//             console.log("Prev Hash >>", result.latestIPFSHash);
//             result.votes += 1;
//             result.latestIPFSHash = newHash;
//         }

//         console.log("Election after modification:", JSON.stringify(election, null, 2));

//         await election.save();
//         console.log("New Hash >>", result.latestIPFSHash);

//         return res.status(200).json({ message: 'Vote added successfully' });

//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// });

const addVoteForElection = asyncHandler(async (req, res) => {
    console.log("Add Vote Election Status API");
    const { electionId, partyId, candidateId, voterId, newHash } = req.body;

    try {
        // Fetch the election by ID
        const election = await Election.findOne({ _id: electionId });

        // Check if election exists
        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        // Check if election is active
        if (!election.isActive) {
            return res.status(400).json({ message: 'Cannot add vote, election status not active' });
        }

        // Verify if the provided partyId is valid within the election
        const isPartyValid = election.parties.some(party => party.party.toString() === partyId);

        if (!isPartyValid) {
            return res.status(400).json({ message: 'Invalid partyId' });
        }

        // Get the party details
        const party = election.parties.find(party => party.party.toString() === partyId);

        // Verify if the provided candidateId is valid for the given party
        if (!party.candidates.includes(candidateId)) {
            return res.status(400).json({ message: 'Invalid candidateId for the specified party' });
        }

        // Check if the voter has already voted in this election
        if (election.voters.includes(voterId)) {
            return res.status(400).json({ message: 'You have already voted in this election' });
        } else {
            // Update hasVoted status for the voter in this election
            election.voters.push(voterId);
        }

        console.log("Election before modification:", JSON.stringify(election, null, 2));

        // Find the result entry for the candidate-party combination
        let result = election.results.find(result =>
            result.party.toString() === partyId && result.candidate.toString() === candidateId
        );

        if (!result) {
            // Candidate-party combination not found, create a new result entry with initial vote count
            console.log("Creating new result entry for partyId:", partyId, "and candidateId:", candidateId);
            resultTemp = {
                party: partyId,
                candidate: candidateId,
                votes: 1,
                latestIPFSHash: newHash,
            };
            election.results.push(resultTemp); // Add the new result entry to the election results array
            console.log("New result entry added:", resultTemp);
        } else {
            // Candidate-party combination found, increment vote count and update the hash
            console.log("Prev Hash >>", result.latestIPFSHash);
            result.votes += 1;
            result.latestIPFSHash = newHash;
        }

        console.log("Election after modification:", JSON.stringify(election, null, 2));

        // Save the updated election document
        await election.save();
        console.log("New Hash >>", result.latestIPFSHash);

        // Respond with success
        return res.status(200).json({ message: 'Vote added successfully' });

    } catch (error) {
        // Log and handle errors
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

        const partyResult = election.results.find(result => result.party.toString() === partyId);
        
        if (!partyResult) {
            return res.status(404).json({ message: 'Party not found in election results' });
        }

        // const hashValue = partyResult.latestIPFSHash;

        // // Fetch data from IPFS using the hash value
        // const ipfsResponse = await axios.get('https://gateway.pinata.cloud/ipfs/' + hashValue);
        // const ipfsData = ipfsResponse.data;

        return res.status(200).json({votes: partyResult });

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

        const candidateResult = election.results.find(result => result.candidate.toString() === candidateId && result.party.toString() === partyId);
        
        if (!candidateResult) {
            return res.status(404).json({ message: 'Candidate not found in election results for the specified party' });
        }

        // const hashValue = candidateResult.latestIPFSHash;

        // // Fetch data from IPFS using the hash value
        // const ipfsResponse = await axios.get('https://gateway.pinata.cloud/ipfs/' + hashValue);
        // const ipfsData = ipfsResponse.data;

        return res.status(200).json({votes: candidateResult});

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


const calculateVotesByParty = asyncHandler(async (req, res) => {
    const { electionId } = req.params;
    console.log(electionId)
    try {
        

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


const getHashValueByPartyCandidate = asyncHandler(async (req, res) => {
    console.log("Get Vote by Candidate Election Status API");
    const { electionId, candidateId, partyId } = req.body;
    console.log("Request body:", req.body);

    try {
        const election = await Election.findOne({ _id: electionId });
        if (!election) {
            console.log(`Election not found for electionId: ${electionId}`);
            return res.status(404).json({ message: 'Election not found' });
        }

        const candidateResult = election.results.find(result => result.candidate.toString() === candidateId && result.party.toString() === partyId);
        if (!candidateResult) {
            console.log(`Candidate not found in election results for candidateId: ${candidateId}, partyId: ${partyId}`);
            return res.status(404).json({ message: 'Candidate not found in election results for the specified party' });
        }

        //const hashValue = candidateResult.latestIPFSHash;
        //console.log(`Hash value found: ${hashValue}`);
        return res.status(200).json({ hashValue: candidateResult.latestIPFSHash });

    } catch (error) {
        console.error(`Error fetching hash value for electionId: ${electionId}, candidateId: ${candidateId}, partyId: ${partyId}`, error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = { addVoteForElection, getAllVotesByParty, getAllVotesByCandidate , calculateVotesByParty , getHashValueByPartyCandidate };
