const express = require("express");
const router = express.Router();

const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");

// todo models
const SuperAdminModel = require("../../models/superAdmin/SuperAdmin.model");

// todo servicess
const { sendMail } = require("../../services/mailsender");
const {
  generateTokenForSuperAdmin,
  authenticateSuperAdmin,
} = require("../../utils/authCokie");

router.get("/signup", (req, res) => {
  try {
    res.render("signup");
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ msg: "Ooops! Something went wrong! Internal error" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, mobileNumber, password, confirmPassword } = req.body;

    const existUser = await SuperAdminModel.findOne({ email });

    if (!name || !email || !mobileNumber || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password !== confirmPassword) {
      console.log("password and confirmPasswaord not match");
      return res
        .status(400)
        .json({ msg: "Password and Confirm Password not match" });
    }

    if (existUser) {
      console.log("user already exist", existUser.name);
      return res.status(400).json({ msg: "user already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let newAdmin = new SuperAdminModel({
      name,
      email,
      mobileNumber,
      password: hashedPassword,
    });

    await newAdmin.save();

    const token = await generateTokenForSuperAdmin(newAdmin);

    res.cookie("360Followups", token, {
      httpOnly: true,
      maxAge: 2 * 30 * 24 * 60 * 60 * 1000,
    });

    // res.status(201).json({ msg: "registration successed !" });
    return res.status(200).json({ msg: "registration success" });
  } catch (error) {
    console.log("Error in /signup post", error);
    res.status(500).json({ msg: "Ooops!, Something went wrong !" });
  }
});

router.get("/login", (req, res) => {
  try {
    return res.render("login");
  } catch (error) {
    console.log("Error in get /login", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    const Admin = await SuperAdminModel.findOne({ email });

    console.log(Admin);
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!Admin) {
      console.log("user already exist", Admin.name);
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, Admin.password);
    console.log(isMatch);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const token = await generateTokenForSuperAdmin(Admin);

    res.cookie("360Followups", token, {
      httpOnly: true,
      maxAge: 2 * 30 * 24 * 60 * 60 * 1000,
    });

    // res.status(201).json({ msg: "Login successed !" });
    console.log("Super admin Login success");
    res.status(200).json({ msg: "authenticated" });
  } catch (error) {
    console.log("Error in /signup post", error);
    res.status(500).json({ msg: "Ooops!, Something went wrong !" });
  }
});

router.get("/reset/password", authenticateSuperAdmin, async (req, res) => {
  try {
    const Admin = await SuperAdminModel.findById(req.SuperAdmin.id);
    if (!Admin) {
      console.log("user Not exist");
      return res.status(401).json({ msg: "User Unauthorized" });
    }

    const { oldPass, newPass, confirmPass } = req.body;

    if (!oldPass || !newPass || !confirmPass) {
      console.log("all fileds required");
      return res.status(401).json({ msg: "All fileds required" });
    }

    if (newPass !== confirmPass) {
      console.log("newPass and OldPass not Matched");
      return res.status(401).json({ msg: "Password and Confirm Password not match" });
    }

    const isMatch = await bcrypt.compare(oldPass, Admin.password);
    console.log(isMatch);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const hashedPassword = await bcrypt.hash(newPass, 10);

    Admin.password = hashedPassword;
    await Admin.save();

    return res.status(200).json({ msg: "Password reset successfully!" });
    
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ msg: "Failed to send password reset email." });
  }
});

router.get("/update/profile", authenticateSuperAdmin, async (req, res) => {
  try {
    const Admin = await SuperAdminModel.findById(req.SuperAdmin.id);
    if (!Admin) {
      console.log("user Not exist");
      return res.status(401).json({ msg: "User Unauthorized" });
    }

    const { name, email, mobileNumber } = req.body;

    if (!name || !email || !mobileNumber) {
      console.log("all fileds required");
      return res.status(401).json({ msg: "All fileds required" });
    }

    Admin.name = name;
    Admin.email = email;
    Admin.mobileNumber = mobileNumber;
    await Admin.save();

    return res.status(200).json({ msg: "Profile Update successfully!" });

  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ msg: "Failed to send password reset email." });
  }
});

router.post("/api/verify", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Email received:", email);

    let admin = await SuperAdminModel.findOne({ email });
    // if (admin) {
    //   return res.status(400).json({msg:"Ooops! Something went wrong!"})
    // }

    // console.log("User lookup result:", user);
    if (admin) {
      return res.status(500).json({ msg: "try with another email !" });
    }

    const otpCode = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    console.log("Generated OTP:", otpCode);
    const mailMsg = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333;">
            <div style="background-color: #4CAF50; padding: 20px; text-align: center; color: #fff; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">OTP Verification</h1>
            </div>
            <div style="padding: 20px; background-color: #ffffff; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
                <p>Hi there,</p>
                <p>To complete your login, please use the following OTP code:</p>
                <div style="font-size: 32px; font-weight: bold; color: #4CAF50; text-align: center; margin: 20px 0;">
                    ${otpCode}
                </div>
                <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
                <p>Thank you!</p>
                <p style="font-weight: bold;">360followups Team</p>
            </div>
        </div>
    `;
    const subject = "Your OTP for Account Creation";

    const isSent = await sendMail("karanghorse91@gmail.com", mailMsg, subject);
    if (!isSent) {
      return res
        .status(500)
        .json({ msg: "Failed to send OTP. Please try again." });
    }
    req.session.otp = otpCode;

    console.warn("mail sent successfully !", isSent);
    console.log(otpCode);
    res.status(201).json({ msg: "mail sent successfully !" });
  } catch (err) {
    console.log("error in /api/verify :- ", err);
    res
      .status(500)
      .json({ msg: "Server error occurred. Please try again later." }); // Add this line to send a response
  }
});

router.post("/api/otp/verify", (req, res) => {
  try {
    let otp = req.session.otp;
    delete req.session.otp;
    let { reqOtp } = req.body;
    console.log(otp, reqOtp);

    if (reqOtp === otp) {
      return res.status(200).json({ msg: "Email verification successfully" });
    } else {
      return res.status(403).json({ msg: "OTP verification failed" });
    }
  } catch (err) {
    console.log("Error in /api/otp/verify", err);
    res
      .status(500)
      .json({ msg: "Server error occurred during OTP verification." });
  }
});

router.get("/dashboard", authenticateSuperAdmin, async (req, res) => {
  try {
    console.log(req.SuperAdmin);
    res.render("dashboardDev");
  } catch (error) {
    console.log("Error in /wsv/super/dashboard -", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

router.post("/invite/team", authenticateSuperAdmin, async (req, res) => {
  try {
    
    
  } catch (error) {
    console.log("Error in /wsv/super/dashboard -", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

module.exports = router;
