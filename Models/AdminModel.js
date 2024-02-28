const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const VERIFIED_STR = "Not Verified";

const adminSchema = mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
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
    password: { 
      type: String, 
      required: true
    },
    verifyToken:{
      type: String,
    },
    province: { 
      type: String, 
      required: true
    },
    city:{
      type: String,
    },
    adminStatus : {
      type: String,
      default : VERIFIED_STR
    },
    isActive : {
      type: Boolean,
      default: false
    },
    isSuperAdmin : {
      type: Boolean,
      default : false
    },
    pic: {
      type: String,
      default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
  },
  { timestamps: true }
);

adminSchema.methods.matchPassword = async function (enteredPass) {
  const enteredPassword = enteredPass.toString().trim();
  const result = await bcrypt.compare(enteredPassword,this.password);
  return result;
};

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const Admin = mongoose.model("Admin", adminSchema , "Administrator", { database: "Voting-System" });

module.exports = Admin;
