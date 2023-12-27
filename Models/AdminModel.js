const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = mongoose.Schema(
  {
    name: { type: "String", required: true },
    email: { type: "String", unique: true, required: true },
    cnic : { type: "number" , unique:true , required:true},
    password: { type: "String", required: true },
    verifyToken:{
      type: "String",
    },
    adminStatus : {
      type:"String",
      default : "Not Verified"
    },
    pic: {
      type: "String",
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
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
