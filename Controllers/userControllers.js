const asyncHandler = require("express-async-handler");
const Users = require("../Models/userModel");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const Citizen = require("../Models/CitizenModel");

dotenv.config();

const generateToken = () => {
  return Math.floor(Math.random() * 900000) + 100000;
};

function sendOtpMailFunc(cnic, otp, pic) {
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
          <img src="${pic}" alt="User Profile"> <!-- Replace with the actual image source -->
          <div class="user-details">
            <p><strong>CNIC:</strong> ${cnic}</p>
          </div>
        </div>
        <p>Use the below provided OTP: </p>
        <p><strong>OTP: </strong> ${otp}</p>
        <p>If you have any questions or concerns, please feel free to contact us by replying to this email.</p>
      </div>
    </div>
  </body>

  </html>
    
  `;
}

const allUsers = asyncHandler(async (req, res) => {
  console.log("User Fetching API");
  try {
    const users = await Users.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const registerUser = asyncHandler(async (req, res) => {
  console.log("User Register API");
  const {
    name,
    email,
    cnic,
    region,
    city,
    registeredElections,
    pic,
    HandImage,
    dob,
  } = req.body;

  if (!name || !email || !cnic || !region || !city || !dob) {
    res.status(400);
    throw new Error("Please fill up all the fields!");
  }

  const voterExist = await Users.findOne({
    cnic,
    "registeredElections.election": { $in: registeredElections.election },
  });

  if (voterExist) {
    res.status(400);
    throw new Error(
      "Voter with this CNIC already registered for this election!"
    );
  }

  const voter = await Users.create({
    email,
    cnic,
    region,
    city,
    registeredElections,
    pic,
    HandImage,
    name,
    dob,
    userToken: generateToken(),
  });

  if (voter) {
    res.status(201).json({
      _id: voter._id,
      cnic: voter.cnic,
      email: voter.email,
      name: voter.name,
      region: voter.region,
      city: voter.city,
      registeredElections: voter.registeredElections,
      pic: voter.pic,
      HandImage: voter.HandImage,
      status: voter.status,
      dob: voter.dob,
      userToken: voter.userToken,
    });

    // Code for sending verification email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.HOST_MAIL,
        pass: process.env.HOST_PASSWORD,
      },
    });

    const sendOTP_MAIL = sendOtpMailFunc(voter);

    const mailOptions = {
      from: process.env.HOST_MAIL,
      to: email,
      subject: "Verify your OTP for Registration!",
      html: sendOTP_MAIL,
    };

    console.log("Sending....");

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Sent!", info.response);
      }
    });
  } else {
    res.status(400);
    throw new Error("Voter not found!");
  }
});

const sendOTPForAuth = asyncHandler(async (req, res) => {
  const { cnic, email } = req.body;

  try {
    const voter = await Users.findOne({ cnic: cnic });
    if (!voter) {
      return res.status(400).json({
        success: false,
        message: "Voter with provided CNIC not found.",
      });
    }

    voter.userToken = generateToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.HOST_MAIL,
        pass: process.env.HOST_PASSWORD,
      },
    });

    const sendOTP_MAIL = sendOtpMailFunc(
      voter.cnic,
      voter.userToken,
      voter.pic
    );

    const mailOptions = {
      from: process.env.HOST_MAIL,
      to: email,
      subject: "Verify your OTP for Authentication!",
      html: sendOTP_MAIL,
    };

    console.log("Sending....");

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Sent!", info.response);
      }
    });

    await voter.save();

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

const authVoter = asyncHandler(async (req, res) => {
  console.log("User Login API");

  const { cnic, otp } = req.body;

  const voter = await Users.findOne({ cnic: cnic });

  if (!voter) {
    res.status(404);
    throw new Error("Voter not found.");
  }

  if (voter.userToken === otp) {
    res.json({
      success: true,
      message: "OTP Verified for CNIC",
      voter: voter,
    });
  } else {
    res.status(401);
    throw new Error("OTP Not Verified.");
  }
});

const alternateLoginOfHandImage = asyncHandler(async (req, res) => {
  const { motherName, fatherCnic, cnic } = req.body;

  // if (!cnic || !fatherCnic || !motherName) {
  //   return res.status(400).json({
  //     success: false,
  //     message: "Provide all the details",
  //   });
  // }

  try {
    const citizen = await Citizen.findOne({ cnic });

    if (!citizen) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    if (
      citizen.motherName === motherName &&
      citizen.fatherCnic === fatherCnic
    ) {
      return res.status(200).json({
        success: true,
        message: "Verification successful",
        voter: citizen,
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "Verification failed",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

const verifyHandImage = asyncHandler(async (req, res) => {
  console.log("Verify Hand Image API");
  const { cnic, handImage } = req.body;

  if (!cnic || !handImage) {
    res.status(402);
    throw new Error("Hand Image / Cnic is missing");
  }
  try {
    const voter = await Users.findOne({ cnic });

    if (!voter) {
      res.status(404);
      throw new Error("Voter not found.");
    }

    if (voter) {
      res.json({
        success: true,
        message: "OTP Verified for CNIC",
        voter: voter,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = {
  allUsers,
  registerUser,
  authVoter,
  alternateLoginOfHandImage,
  sendOTPForAuth,
  verifyHandImage,
};
