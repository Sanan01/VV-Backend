const asyncHandler = require('express-async-handler');
const dotenv = require('dotenv');
const Election = require("../Models/ElectionModel");

dotenv.config();

const registerElection = asyncHandler(async (req, res) => {
    console.log("Election Register API");
    const { name, startDate, endDate, parties } = req.body;
    console.log("Data in Register Election >> ", name, startDate, endDate, parties);

    if (!name || !startDate || !endDate || !parties) {
        res.status(400);
        throw new Error("Please fill up all the fields!");
    }

    const electionExist = await Election.findOne({ name });

    if (electionExist) {
        res.status(400);
        throw new Error("Election with this data already exists!");
    }

    // Check if each party has at least one candidate registered with it
    const isValidParties = parties.every(party => Array.isArray(party.candidates) && party.candidates.length > 0);

    if (!isValidParties) {
        res.status(400);
        throw new Error("Each party must have at least one candidate registered with it");
    }

    const election = await Election.create({
        name,
        startDate,
        endDate,
        parties,
        isActive: false,
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
        });
    } else {
        res.status(400);
        throw new Error("Election not created!");
    }
});



const allElections = asyncHandler(async (req, res) => {
    console.log("Elections all API");
    try {
        const elections = await Election.find();
        res.json(elections);
      } catch (error) {
        console.error('Error fetching Elections:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
});

const getElections = asyncHandler(async (req, res) => {
    console.log("Get Election API");
    try {
        const elections = await Election.find()
            .populate({
                path: 'parties',
                populate: {
                    path: 'party candidates',
                    select: 'name abbreviation leader symbol', // Select fields you want to include
                }
            });

        // Transform the response to include party and candidate details
        const transformedElections = elections.map(election => {
            const transformedParties = election.parties.map(party => ({
                ...party.toObject(),
                party: {
                    ...party.party.toObject() // Transform party object to plain JavaScript object
                },
                candidates: party.candidates.map(candidate => ({
                    ...candidate.toObject() // Transform candidate object to plain JavaScript object
                }))
            }));
            return {
                ...election.toObject(), // Transform election object to plain JavaScript object
                parties: transformedParties
            };
        });

        res.json(transformedElections);
    } catch (error) {
        console.error('Error fetching Elections:', error);
        res.status(500).json({ message: 'Internal Server Error' });
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






module.exports = {registerElection , allElections , getElections , toggleElectionStatus , deleteElection};