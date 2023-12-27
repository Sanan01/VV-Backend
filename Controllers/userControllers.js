const asyncHandler = require('express-async-handler');
const Users = require("../Models/userModel");

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

const searchUser = asyncHandler(async(req,res)=>{
    console.log("Search User Fetching API")
    try {
        const searchTerm = req.query.term;
        // Create a query to find users based on the search term
        const users = await Users.find({
          $or: [
            { cnic: { $regex: new RegExp(searchTerm, 'i') } }, // Case-insensitive search for name
            { name: { $regex: new RegExp(searchTerm, 'i') } } // Case-insensitive search for CNIC
          ],
        });
    
        res.json(users);
      } catch (error) {
        console.error('Error fetching filtered users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});

module.exports = {allUsers,searchUser};
  