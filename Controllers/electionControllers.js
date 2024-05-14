
const asyncHandler = require('express-async-handler');
const dotenv = require('dotenv');
const Election = require("../Models/ElectionModel");

dotenv.config();

const registerElection = asyncHandler(async (req, res) => {
    console.log("Election Register API");
    const { name, startDate, endDate , parties , results } = req.body;
    console.log("Data in Register Election >> ", name, startDate, endDate , parties , results);

    if (!name || !startDate || !endDate) {
        res.status(400);
        throw new Error("Please fill up all the fields!");
    }

    const electionExist = await Election.findOne({ name });

    if (electionExist) {
        res.status(400);
        throw new Error("Election with this data already exists!");
    }

    // Check if each party has at least one candidate registered with it
    // const isValidParties = parties.every(party => Array.isArray(party.candidates) && party.candidates.length > 0);

    // if (!isValidParties) {
    //     res.status(400);
    //     throw new Error("Each party must have at least one candidate registered with it");
    // }

    const election = await Election.create({
        name,
        startDate,
        endDate,
        parties,
        isActive: false,
        isRegActive:false,
        creationDate: Date.now()
    });

    console.log("Election Created >>", election);

    if (election) {
        res.status(201).json({
            _id: election._id,
            name: election.name,
            startDate: election.startDate,
            endDate: election.endDate,
            parties: election.parties,
            isActive: election.isActive,
            creationDate: election.creationDate,
            isRegActive : election.isRegActive,
        });
    } else {
        res.status(400);
        throw new Error("Election not created!");
    }
});

const axios = require('axios');
const BEARER_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1Njg4OTJiYy05NTVkLTRmZjMtOWQ4ZC1kYWQwODUwMDhlMGIiLCJlbWFpbCI6Im11aGFtbWFkenVuaXF1ZTRAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjM5NjcyYmQwZjA0MWZmYTAxOTMyIiwic2NvcGVkS2V5U2VjcmV0IjoiZjAzMGIxMTU0ZGI4ZDU3MmJjZDVhOTQ2NDM4YmRjODM4NDZhMDdmNjM3ZWFkZTkyOWE1MzNlN2FhZmY0NDg4ZCIsImlhdCI6MTcxNTY4ODg2MX0.rEN1X8p37uWQZxifMKDW8bVzThaLJ7pSEz4Z-UnIi1E';

const getElections = asyncHandler(async (req, res) => {
    console.log("Get Election API");
    try {
        const elections = await Election.find()
            .populate({
                path: 'parties',
                populate: {
                    path: 'party candidates',
                    select: 'name abbreviation leader symbol',
                }
            });

        const transformedElections = await Promise.all(elections.map(async (election) => {
            const transformedResults = await Promise.all(election.results.map(async (result) => {
                try {
                    const ipfsResponse = await axios.get(
                        'https://gateway.pinata.cloud/ipfs/' + result.latestIPFSHash,
                        {
                            headers: {
                                'Authorization': BEARER_TOKEN
                            }
                        }
                    );

                    // Check if the response data format is as expected
                    if (!ipfsResponse.data || !ipfsResponse.data.data || !ipfsResponse.data.data.voteCount) {
                        throw new Error('Unexpected IPFS response format');
                    }

                    const ipfsData = ipfsResponse.data.data;
                    result.votes = ipfsData.voteCount;
                    return result;
                } catch (error) {
                    console.error('Error fetching data from IPFS:', error.response ? error.response.data : error.message);
                    throw error;
                }
            }));

            const transformedParties = election.parties.map(party => ({
                ...party.toObject(),
                party: {
                    ...party.party.toObject()
                },
                candidates: party.candidates.map(candidate => ({
                    ...candidate.toObject()
                }))
            }));

            return {
                ...election.toObject(),
                parties: transformedParties,
                results: transformedResults
            };
        }));

        res.json(transformedElections);
    } catch (error) {
        console.error('Error fetching Elections:', error.message);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});


const deleteElection = asyncHandler(async (req, res) => {
    console.log("Delete Election API");

    const { electionId } = req.body;
    console.log(electionId);

    try {
        const election = await Election.findOne({ _id: electionId });

        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        if (election.isActive) {
            return res.status(400).json({ message: 'Cannot delete active election' });
        }

        const deletedElection = await Election.findOneAndDelete({ _id: electionId });

        if (!deletedElection) {
            return res.status(404).json({ message: 'Election not found' });
        }

        res.json({ message: 'Election removed successfully', deletedElection });
    } catch (error) {
        console.error('Error deleting election:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

const toggleElectionStatus = asyncHandler(async (req, res) => {
    console.log("Toggle Election Status API");

    const { electionId } = req.body;
    if (!electionId) {
        return res.status(400).json({ success: false, message: 'Election ID is required in the request body' });
    }
    const election = await Election.findById(electionId);

    if (!election) {
        return res.status(404).json({ success: false, message: 'Election not found' });
    }
    console.log("Prev Status >>" , election.isActive)
    election.isActive = !election.isActive;
    await election.save();
    console.log("After Status >>" , election.isActive)

    res.status(200).json({ success: true, message: 'Election status toggled successfully', data: election });
    
   
});

const addPartyToElection = asyncHandler(async (req, res) => {
    console.log("Add Party to Election API");
    const { electionId, partyId, candidates } = req.body;
    console.log(electionId, partyId, candidates);

    try {
        // Find the election
        const election = await Election.findById(electionId);

        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        // Check if the party already exists in the election
        const existingPartyIndex = election.parties.findIndex(party => party.party.toString() === partyId);
        if (existingPartyIndex !== -1) {
            // If party already exists, check if any of the candidates are already in the party
            const existingParty = election.parties[existingPartyIndex];
            const existingCandidateIds = existingParty.candidates.map(candidate => candidate.toString());
            const newCandidateIds = candidates.map(candidate => candidate.toString());

            // Check if any of the new candidates are already in the party
            const duplicates = newCandidateIds.filter(candidateId => existingCandidateIds.includes(candidateId));
            if (duplicates.length > 0) {
                return res.status(400).json({ message: 'Some candidates are already assigned to the party' });
            }

            // Add new candidates to the existing party
            existingParty.candidates.push(...candidates);
        } else {
            // If party doesn't exist, create a new party and add it to the election
            election.parties.push({
                party: partyId,
                candidates: candidates
            });
        }

        await election.save();

        return res.status(200).json({ message: 'Party added to the election successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

const removePartyFromElection = asyncHandler(async (req, res) => {
    console.log("Remove Party from Election API");
    
    const { electionId, partyId } = req.body;

    console.log(electionId, partyId);

    try {
        // Find the election
        const election = await Election.findById(electionId);

        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        // Check if the party exists in the election
        const existingPartyIndex = election.parties.findIndex(party => party.party.toString() === partyId);
        if (existingPartyIndex === -1) {
            return res.status(400).json({ message: 'Party does not exist in the election' });
        }

        // Remove the party from the election
        election.parties.splice(existingPartyIndex, 1);

        await election.save();

        return res.status(200).json({ message: 'Party removed from the election successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

const toggleIsRegActive = asyncHandler(async(req,res) => {
    console.log("Is Reg Active API");

    const { electionId } = req.body;
    if (!electionId) {
        return res.status(400).json({ success: false, message: 'Election ID is required in the request body' });
    }
    const election = await Election.findById(electionId);

    if (!election) {
        return res.status(404).json({ success: false, message: 'Election not found' });
    }
    election.isRegActive = !election.isRegActive;
    await election.save();

    res.status(200).json({ success: true, message: 'Election status toggled successfully', data: election });

});

module.exports = {registerElection  , getElections , toggleElectionStatus , deleteElection , addPartyToElection , removePartyFromElection , toggleIsRegActive};