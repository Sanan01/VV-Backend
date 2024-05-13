
const asyncHandler = require('express-async-handler');
const dotenv = require('dotenv');
const Citizen = require("../Models/CitizenModel");

dotenv.config();

const registerCitizen = asyncHandler(async(req,res) =>{
    console.log("Citizen Register API");
    const {name,cnic,dob,email,country,city,fatherName,motherName,sex,address,contactNo , pic , fatherCnic} =  req.body;
    

    if (!name || !email || !dob || !cnic || !country || !city || !motherName || !fatherName || !sex || !address || !contactNo || !fatherCnic){
        res.status(400);
        throw new Error("Please Fill up all the feilds!")
    }

    const citizenExists = await Citizen.findOne({ cnic });
    console.log("Registration API hit!")

    if (citizenExists) {
        res.status(400);
        throw new Error("Citizen with this Credentials Already Exists!");
    }

    const citizen = await Citizen.create({
        name,cnic,dob,email,country,city,fatherName,motherName,sex,address,contactNo ,pic,fatherCnic
    });

    console.log("Citizen in Register >> " , citizen)
    
    if (citizen) {
        res.status(201).json({
            _id: citizen._id,
            name: citizen.name,
            email: citizen.email,
            cnic: citizen.cnic,
            fatherName: citizen.fatherName,
            motherName:citizen.motherName,
            dob: citizen.dob,
            sex: citizen.sex,
            address: citizen.address,
            contactNo: citizen.contactNo,
            pic: citizen.pic,
            country:citizen.country,
            city:citizen.city,
            fatherCnic: citizen.fatherCnic
    });
    } else {
    res.status(400);
    throw new Error("Citizen not Created!");
    }
});

const allCitizen = asyncHandler(async (req, res) => {
    console.log("Citizen all API");
    try {
        const citizens = await Citizen.find();
        res.json(citizens);
      } catch (error) {
        console.error('Error fetching Citizens:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
});

const getCitizenCnicVerified = asyncHandler(async (req, res) => {
    console.log("Citizen get Cnic Verified API");
    const {cnic} = req.params; ;
    console.log("Cnic >>" , cnic)
    try {
        const citizen = await Citizen.findOne({cnic});
        
        if(citizen){
            res.status(200).json({
                success: true,
                message: 'Cnic Found.',
                citizen: citizen,
              });
        }
        else{
            res.status(404).json({
                success: false,
                message: 'Cnic No. not Found.',
              });
        }
      } catch (error) {
        console.error('Error fetching Citizens:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
});

module.exports = {registerCitizen , allCitizen , getCitizenCnicVerified};