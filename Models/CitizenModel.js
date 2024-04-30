const mongoose = require('mongoose');

const citizenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  cnic: {
    type:Number,
    required: true,
    unique:true
  },
  dob: {
    type: Date,
    required: true,
  },
  email:{
    type:String,
    required:true,
  },
  country: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  fatherName: {
    type: String,
    required: true,
  },
  fatherCnic : {
    type: Number,
    required: true
  },
  motherName: {
    type: String,
    required: true,
  },
  sex: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  contactNo: {
    type: Number,
    required: true,
  },
  pic : {
    type:String,
    required:false,
    default:
      "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
  },
});

const Citizen = mongoose.model("Citizen", citizenSchema , "Citizens", { database: "Voting-System" });

module.exports = Citizen;
