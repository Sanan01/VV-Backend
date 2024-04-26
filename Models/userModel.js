const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
  region :{
    type: String,
    required: true
  },
  city :{
    type: String,
    required: true
  },
  hasVoted: {
    type: Boolean,
    default: false
  },
  registeredElections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
  }],
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  pic: {
    type: String,
    default:
      "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
  },
  HandImage :{
    type : String,
    default : "",
  },
  userToken :{
    type : Number
  }
});

const Users = mongoose.model("Users", userSchema , "Users", { database: "Voting-System" });

module.exports = Users;

