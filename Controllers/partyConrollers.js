
const asyncHandler = require('express-async-handler');
const dotenv = require('dotenv');
const Party = require("../Models/PartyModel");

dotenv.config();

const allParty = asyncHandler(async (req, res) => {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
          ],
        }
      : {};
  
    const party = await Party.find({ ...keyword, _id: { $ne: req.party._id } });
    res.send(party);
});

const registerParty = asyncHandler(async(req,res) =>{
  const {name, symbol , abbreviation , leader , foundingDate , registrationDate , ideology , manifesto} = req.body;
  console.log(" Party Registration API hit!")

  if (!name || !symbol || !abbreviation || !leader || !foundingDate || !registrationDate || !ideology || !manifesto){
      res.status(400);
      throw new Error("Please Fill up all the feilds!")
  }

  const PartyExists = await Party.findOne({ $or: [{ leader }, { name } , {abbreviation}] });
  

  if (PartyExists) {
      res.status(400);
      throw new Error("Party with this Data Already Exists!");
  }

  const party = await Party.create({
      name, symbol , abbreviation , leader , foundingDate , registrationDate , ideology , manifesto
  });

  console.log("Party in Register >> " , party)
  
  if (party) {
      res.status(201).json({
          _id: party._id,
          name: party.name,
          symbol: party.symbol,
          abbreviation: party.abbreviation,
          leader: party._id,
          foundingDate: party.foundingDate,
          registrationDate: party.registrationDate,
          ideology: party.ideology,
          manifesto: party.manifesto,
          
          
  });


  } else {
  res.status(400);
  throw new Error("Party not Created!");
  }
});

const getParty = asyncHandler(async (req, res) => {
  console.log("Party Fetching API")
    try {
        const party = await Party.find();
        res.json(party);
      } catch (error) {
        console.error('Error fetching party:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
});


const deleteParty = asyncHandler(async (req, res) => {
  const { partyId } = req.body;
  console.log(partyId)
  console.log("Party Deleting API");

  try {
    // Assuming `Party` is your Mongoose model
    const party = await Party.findOneAndDelete({ _id: partyId });

    if (!party) {
      // If party is not found
      return res.status(404).json({ message: 'Party not found' });
    }

    res.json({ message: 'Party deleted successfully', deletedParty: party });
  } catch (error) {
    console.error('Error deleting party:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = {allParty , registerParty , getParty , deleteParty};