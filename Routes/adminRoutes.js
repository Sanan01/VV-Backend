const express = require("express");
const { protect } = require("../Middleware/authMiddleware");

const {authAdmin , allAdmins , registerAdmin ,getAdmin,  verifyAccount , resetPassword , forgotPassword} = require('../Controllers/adminControllers');

const router = express.Router();

router.route("/").post(registerAdmin).get(protect,allAdmins);
router.post("/login", authAdmin);
router.get("/getAdmin", getAdmin);
router.put("/verifyAccount/:id",verifyAccount);
router.post("/forgotPassword",forgotPassword);
router.put("/resetPassword",resetPassword);

module.exports = router;