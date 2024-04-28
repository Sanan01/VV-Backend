const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true 
  },
  password:{
    type: String,
    required: true 
  },
  dob:{
    type: Date,
    required:true
  },
  status:{
    type: String,
    default: 'not-verified'
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
  region :{
    type: String,
    required: true
  },
  city :{
    type: String,
    required: true
  },
  registeredElections: [{
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election'
    },
    hasVoted: {
      type: Boolean,
      default: false
    }
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
  userToken: {
    type: String
  }

});

const Users = mongoose.model("Users", userSchema , "Users", { database: "Voting-System" });

module.exports = Users;
