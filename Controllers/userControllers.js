const asyncHandler = require('express-async-handler');
const Users = require("../Models/userModel");
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const generateToken = () => {
  return Math.floor(Math.random() * 900000) + 100000;
};

function sendOtpMailFunc(voter){
  return `
  <!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
      .verify-button {
        background-color: #4caf50;
        color: white;
        border: none;
        text-decoration: none;
        padding: 10px 20px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        border-radius: 5px;
        cursor: pointer;
      }

      .user-info {
        display: flex;
        align-items: center;
      }

      .user-info img {
        width: 50px; /* Adjust the size as needed */
        height: 50px; /* Adjust the size as needed */
        border-radius: 50%;
        margin-right: 10px;
      }

      .user-details {
        flex: 1;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="header">
        <h5>Account Creation Request</h5>
      </div>
      <div class="content">
        <div class="user-info">
          <img src="${voter.pic}" alt="User Profile"> <!-- Replace with the actual image source -->
          <div class="user-details">
            <p><strong>CNIC:</strong> ${voter.cnic}</p>
          </div>
        </div>
        <p>Use the below provided OTP: </p>
        <p><strong>OTP: </strong> ${voter.userToken}</p>
        <p>If you have any questions or concerns, please feel free to contact us by replying to this email.</p>
      </div>
    </div>
  </body>

  </html>
    
  `;
}

const allUsers = asyncHandler(async (req, res) => {
    console.log("User Fetching API")
    try {
        const users = await Users.find();
        res.json(users);
      } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
});

const registerUser = asyncHandler(async (req, res) => {
  console.log("User Register API");
  const { email, cnic, region, city, registeredElection, pic, HandImage } = req.body;
  
  if (!cnic || !email || !region || !city || !registeredElection || !HandImage){
    res.status(400);
    throw new Error("Please Fill up all the feilds!")
  }

  const voterExist = await Users.findOne({ $and: [{ cnic }, { registeredElection }] });

  if (voterExist) {
    res.status(400);
    throw new Error("Voter with this Cnic already Registered for this Election!");
  }

  const voter = await Users.create({
    email,
    cnic,
    region,
    city,
    registeredElection,
    pic,
    HandImage
  });

  if(voter){
    res.status(201).json({
      _id: voter._id,
      cnic: voter.cnic,
      email: voter.email,
      region: voter.region,
      city: voter.city,
      registeredElection: voter.registeredElection,
      pic: voter.pic,
      HandImage: voter.HandImage,
      userToken: generateToken(),
    });

    const transporter = nodemailer.createTransport({
      service:"gmail",
        auth: {
          user: process.env.HOST_MAIL,
          pass: process.env.HOST_PASSWORD,
        },
      });

      const sendOTP_MAIL = sendOtpMailFunc(voter);

      const mailOptions = {
        from: process.env.HOST_MAIL ,
        to: email,
        subject: 'Verify your OTP for Registration!',
        html:sendOTP_MAIL
      };

      console.log("Sending....");

      transporter.sendMail(mailOptions,(err,info)=>{
        if(err){
            console.log("Error",err)
        }else{
            console.log("Sent!",info.response);
        }
     });

  }else{
    res.status(400);
    throw new Error("Voter not Found!");
  }

});


const authVoter = asyncHandler(async (req, res) => {
  console.log("User Login API");

  const { cnic , HandImage } = req.body;

  const voter = await Users.find({cnic: cnic});

  if(voter){
    res.json({
      _id: voter._id,
      cnic: voter.cnic,
      email: voter.email,
      region: voter.region,
      city: voter.city,
      pic: voter.pic,
      registeredElections : voter.registeredElections,
  });
  }else{
    res.status(401);
    throw new Error("Invalid Credentials for Voter.");
  }
});


module.exports = {allUsers , registerUser};
  