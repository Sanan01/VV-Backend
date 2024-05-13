const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  party: {
    // type: mongoose.Schema.Types.ObjectId,
    // ref: 'Party',
    type:String,
    required: true,
  },
  cnic: {
    type: Number,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
  electionManifesto: {
    type: String,
    required: true,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  province: {
    type: String,
  },
  city: {
    type: String,
  },
  image: {
    type: String,
    default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg" ,
  },
});

const Candidate = mongoose.model("Candidate", candidateSchema , "Candidates", { database: "Voting-System" });

module.exports = Candidate;
