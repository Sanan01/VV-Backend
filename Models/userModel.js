const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: { 
    type: String,
    unique: true, 
    required: true 
  },
  cnic : { 
    type: Number , 
    unique:true ,
    required:true
  },
  age: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  voted: {
    type: Boolean,
    default: false,
  },
  votedParty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party',
  },
  votedCandidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  pic: {
    type: String,
    default:
      "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
  },
  handImage :{
    type : String,
    default : "",
  }
});

const Users = mongoose.model("Users", userSchema , "Users", { database: "Voting-System" });

module.exports = Users;

