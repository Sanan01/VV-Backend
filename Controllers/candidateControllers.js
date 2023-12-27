const asyncHandler = require('express-async-handler');
const dotenv = require('dotenv');
const Candidate = require("../Models/CandidateModel");

dotenv.config();

const registerCandidate = asyncHandler(async (req, res) => {
  console.log("Candidate Register API");
  const { name, cnic, image, party, experience, position, electionManifesto, registrationDate } = req.body;

  console.log("Data in Register >>" ,  name, cnic, image, party, experience, position, electionManifesto, registrationDate )
  let tempExp = experience
  if(tempExp === 0){
    tempExp = 1; 
  }
  
  if (!name || !image || !party || !cnic || !tempExp || !position || !electionManifesto || !registrationDate) {
      res.status(400);
      throw new Error("Please Fill up all the fields!");
  }

  const candidateExists = await Candidate.findOne({ cnic });
  console.log("Candidate Registration API hit!");

  if (candidateExists) {
      res.status(400);
      throw new Error("Candidate with this Credentials Already Exists!");
  }

  const candidate = await Candidate.create({
    name, cnic, image, party, experience, position, electionManifesto, registrationDate
  });

  console.log("Candidate in Register >> ", candidate);

  if (candidate) {
      res.status(201).json({
          _id: candidate._id,
          name: candidate.name,
          image: candidate.image,
          cnic: candidate.cnic,
          party: candidate.party,
          experience: candidate.tempExp,
          position: candidate.position,
          electionManifesto: candidate.electionManifesto,
          registrationDate: candidate.registrationDate,
      });
  } else {
      res.status(400);
      throw new Error("Candidate not Created!");
  }
});

const getCandidates = asyncHandler(async (req, res) => {
    console.log("Candidate Fetching API")
      try {
          const candidates = await Candidate.find().populate('party');;
          res.json(candidates);
        } catch (error) {
          console.error('Error fetching Candidates:', error);
          res.status(500).json({ message: 'Internal Server Error' });
        }
  });

const allCandidate = asyncHandler(async (req, res) => {
    console.log("Candidate all API");
    try {
        const candidates = await Candidate.find();
        res.json(candidates);
      } catch (error) {
        console.error('Error fetching Candidates:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
});

const deleteCandidate = asyncHandler(async (req, res) => {
  const { candidateId } = req.body;
  console.log(candidateId)
  console.log("Candidate Deleting API");

  try {
    // Assuming `Party` is your Mongoose model
    const candidate = await Candidate.findOneAndDelete({ _id: candidateId });

    if (!candidate) {
      // If party is not found
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.json({ message: 'Candidate deleted successfully', deletedCandidate: candidate });
  } catch (error) {
    console.error('Error deleting party:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = {registerCandidate , allCandidate , getCandidates , deleteCandidate};