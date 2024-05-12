const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  parties: [
    {
      party: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party',
        required: true,
      },
      candidates: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Candidate',
          required: true,
        },
      ],
    },
  ],
  voters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  results: [
    {
      party: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party',
      },
      candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
      },
      votes: {
        type: Number,
        default: 0,
      },
    },
  ],
  isActive: {
    type: Boolean,
    default: false,
  },
  isRegActive: {
    type: Boolean,
    default: false,
  },
  creationDate: {
    type: Date,
    default: Date.now(),
  },
});

// Custom validator to ensure each party has candidates registered with it
electionSchema.path('parties').validate(function(parties) {
    return parties.every(party => Array.isArray(party.candidates) && party.candidates.length > 0);
}, 'Each party must have at least one candidate registered with it');

const Election = mongoose.model("Election", electionSchema , "Elections", { database: "Voting-System" });

module.exports = Election;
