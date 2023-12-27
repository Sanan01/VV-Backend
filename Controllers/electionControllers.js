const asyncHandler = require('express-async-handler');
const dotenv = require('dotenv');
const Election = require("../Models/ElectionModel");

dotenv.config();

const registerElection = asyncHandler(async(req,res) =>{
    console.log("Election Register API");
    //creation Date and isActive by default jayega
    const {name, startDate , endDate , parties , candidates} = req.body;
    console.log("Data in Register Election >> " , name, startDate , endDate , parties , candidates );

    if(!name || !startDate || !endDate || !parties || !candidates){
        res.status(400);
        throw new Error("Please Fill up all the feilds!");
    }

    const electionExist = await Election.findOne({ name });

    if(electionExist){
        res.status(400);
        throw new Error("Election with this Data Already Exists!");
    }

    const election = await Election.create({
        name, 
        startDate, 
        endDate, 
        parties, 
        candidates, 
        isActive:false , 
        creationDate: Date.now() 
    });

    console.log("Election Created >>" , election);

    if(election){
        res.status(201).json({
            _id: election._id,
            name: election.name,
            startDate: election.startDate,
            endDate: election.endDate,
            parties: election.parties,
            candidates: election.candidates,
            isActive: election.isActive,
            creationDate: election.creationDate,     
    });
    }else{
        res.status(400);
        throw new Error("Election not Created!");
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
                path: 'parties', // Use 'parties' instead of 'Party'
                select: 'name abbreviation leader _id symbol',
            }).populate({
                path: 'candidates', // Use 'parties' instead of 'Party'
                select: 'name _id party cnic position image ',
            });

        res.json(elections);
    } catch (error) {
        console.error('Error fetching Elections:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = getElections;

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