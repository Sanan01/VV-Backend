const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
const Admin = require("../Models/AdminModel");
const generateToken = require('../Config/generateToken');

dotenv.config();

const generateTokenForPassword = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "150s",
    });
};

function registrationHTMLFunc(admin , URL) {
  return `
  <!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Creation Request</title>
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
          <img src="${admin.pic}" alt="User Profile"> <!-- Replace with the actual image source -->
          <div class="user-details">
            <p><strong>Name:</strong> ${admin.name}</p>
            <p><strong>CNIC:</strong> ${admin.cnic}</p>
          </div>
        </div>
        <p>Click the button below to verify the account:</p>
        <button class="verify-button"><a href=${URL}>Verify Account</a></button>
        <p>If you have any questions or concerns, please feel free to contact us by replying to this email.</p>
      </div>
    </div>
  </body>

  </html>
    
  `;
}

function resetPasswordFunc(admin,URL_For_Password,Token){
  return `
  <!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Creation Request</title>
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
        <h5>Reset Password Request</h5>
      </div>
      <div class="content">
        <div class="user-info">
          <img src="${admin.pic}" alt="User Profile"> <!-- Replace with the actual image source -->
          <div class="user-details">
            <p><strong></strong>Hello, ${admin.name}</p>
            <p>A Password Updation Request has been initiated for you Account on Visionary-Voting. Ignore This email if you have not initiated it. Your Account password will be unchanged. If does <strong>Click the Below to update that.</strong></p>
          </div>
        </div>
        <p>Click the button below to verify the account:</p>
        <p>Use This Token There : <strong>${Token}</strong></p>
        <button class="verify-button"><a href=${URL_For_Password}>Reset Password</a></button>
        <p>This Link will expire in <strong>150 seconds</strong></p>
        <p>If you have any questions or concerns, please feel free to contact us by replying to this email.</p>
      </div>
    </div>
  </body>

  </html>
    
  `;
}

const authAdmin = asyncHandler(async (req, res) => {
  const { email, password , cnic } = req.body;

  const admin = await Admin.findOne({ $and: [{ cnic }, { email }] });

  // const verifyEncryptedPass = await admin.matchPassword(password);

  if (admin) {
    if(admin.adminStatus !== 'verified'){
      res.status(404).json({
        success: false,
        message: 'Admin not Verified.',
      });
    }
    else{
      const token = generateToken(admin._id);
  
      res.json({
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          cnic: admin.cnic,
          pic: admin.pic,
          adminStatus: admin.adminStatus,
          token: token,
          isSuperAdmin : admin.isSuperAdmin,
      });
    }
  }
  else {
      res.status(401);
      throw new Error("Invalid Credentials!");
}
});

const registerAdmin = asyncHandler(async(req,res) =>{
    const {name, email, password , cnic, pic , selectedProvince, selectedCities} = req.body;

    console.log(name, email, password , cnic, pic , selectedProvince, selectedCities);
    
    if (!name || !email || !password || !cnic || !selectedProvince || !selectedCities){
        res.status(400);
        throw new Error("Please Fill up all the feilds!")
    }

    const adminExists = await Admin.findOne({ $or: [{ cnic }, { email }] });
    console.log("Registration API hit!")

    if (adminExists) {
        res.status(400);
        throw new Error("Admin with this Credentials Already Exists!");
    }

    const admin = await Admin.create({
        name,
        cnic,
        email,
        password,
        pic,
        city: selectedCities,
        province: selectedProvince,
    });

    console.log("Admin in Register >> " , admin)
    
    if (admin) {
        res.status(201).json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            cnic: admin.cnic,
            pic: admin.pic,
            province: admin.province,
            city: admin.city,
            token: generateToken(admin._id),
            adminStatus:admin.adminStatus,
    });

    const URL = `http://localhost:3000/verifyAccount/${admin.id}`

    const transporter = nodemailer.createTransport({
      service:"gmail",
        auth: {
          user: process.env.HOST_MAIL,
          pass: process.env.HOST_PASSWORD,
        },
      });
      const registarionSuccessfullEmail = registrationHTMLFunc(admin , URL);

      const mailOptions = {
        from: process.env.HOST_MAIL ,
        to: email,
        subject: 'Registration Successful!',
        html:registarionSuccessfullEmail
      };
      console.log("Sending....")
     transporter.sendMail(mailOptions,(err,info)=>{
        if(err){
            console.log("Error",err)
        }else{
            console.log("Sent!",info.response);
        }
     });



    } else {
    res.status(400);
    throw new Error("Admin not Found!");
    }
});


const verifyAccount = asyncHandler(async (req, res) => {
  console.log("Verify Account API Hit");

  const { id } = req.params;

  try {
    const validAdmin = await Admin.findOne({ _id: id });

    if (validAdmin) {
      validAdmin.adminStatus = 'verified';
      await validAdmin.save();

      res.status(200).json({
        success: true,
        message: 'Account verified successfully.',
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Admin not found.',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
});


const allAdmins = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { cnic: { $regex: req.query.search, $options: 'i' } },
        ],
      }
    : {};

  const admins = await Admin.find({ ...keyword, _id: { $ne: req.admin._id } });
  res.send(admins);
});


const getAdmin = asyncHandler(async (req, res) => {
  console.log("Admin Fetching API")
    try {
        const admins = await Admin.find();
        res.json(admins);
      } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
      }
});


const forgotPassword = asyncHandler(async (req, res) => {
  console.log("Forgot Password API Hit");

  const {email} = req.body;

  console.log(email)

  if(!email){
    res.status(401).json({
      status:401,
      message:"Please Enter your Email to Proceed Further."});
  }

  try{
    const admin = await Admin.findOne({ email });

    if(!admin){
      return res.status(404).json({
        success:false,
        message:"User with this credentials does not exist!"
      })
    }

    const tokenForPassword = generateTokenForPassword(admin._id);

    const setAdminToken = await Admin.findByIdAndUpdate({_id:admin._id},{verifyToken:tokenForPassword},
      {new:true});

    if(setAdminToken){
      const URL_For_Password = `http://localhost:3000/resetPassword`;

      const transporter = nodemailer.createTransport({
        service:"gmail",
          auth: {
            user: process.env.HOST_MAIL,
            pass: process.env.HOST_PASSWORD,
          },
        });

        const resetPasswordEmail = resetPasswordFunc(admin , URL_For_Password , tokenForPassword);

        const mailOptions = {
          from: process.env.HOST_MAIL ,
          to: email,
          subject: 'Reset Password',
          html:resetPasswordEmail
        };
        console.log("Sending....")
        transporter.sendMail(mailOptions,(err,info)=>{
        if(err){
          console.log("Error",err)
        }else{
            console.log("Sent!",info.response);
          }
      });

    }

  }catch(error){
    console.error(error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
  }
});


const resetPassword = asyncHandler(async (req, res) => {
  console.log("Reset Password API Hit");

  const { token, cnic, newPassword } = req.body;

  try {
    const admin = await Admin.findOne({ cnic });
    console.log(admin);

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "User with the provided CNIC not found",
      });
    }

    if (token !== admin.verifyToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    admin.password = newPassword;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

const revertAccess = asyncHandler(async (req, res) => {
  console.log("Revert Access API Hit");

  const { adminId } = req.body;
  console.log(adminId)

  try {
    const admin = await Admin.findOne({ _id: adminId });
    console.log(admin);

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "User with the provided ID not found",
      });
    }

    admin.adminStatus = admin.adminStatus === 'verified' ? 'Not verified' : 'verified';
    
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Acess Revert Successfull",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

const makeSuperAdmin = asyncHandler(async (req, res) => {
  console.log("Convert Super Admin API Hit");

  const { adminId } = req.body;
  console.log(adminId)

  try {
    const admin = await Admin.findOne({ _id: adminId });
    console.log(admin);

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "User with the provided ID not found",
      });
    }

    admin.isSuperAdmin = !admin.isSuperAdmin 
    
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Super Admin Added Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});


module.exports = {authAdmin , registerAdmin , allAdmins , getAdmin ,verifyAccount , resetPassword , forgotPassword , revertAccess , makeSuperAdmin};

