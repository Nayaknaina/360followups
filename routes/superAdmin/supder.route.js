const express = require('express');
const router = express.Router();


const otpGenerator = require("otp-generator");

// todo models
const SuperAdminModel = require('../../models/SuperAdmin.model')

// todo servicess
const {sendMail} = require('../../services/mailsender')



router.get('/signup',(req,res)=>{
    try {
        res.render('signup');
    } catch (error) {
        console.log(error)
        res.status(400).json({msg: "Ooops! Something went wrong! Internal error"})
    }
})

router.post('/signup',async(req,res)=>{
    try {
        const {name, email, mobile ,password, confirmPassword} = req.body;

        const existUser = await SuperAdminModel.findOne({email})

        
        if (!name || !email || !mobile || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        if(password !== confirmPassword){
            console.log('password and confirmPasswaord not match');
            return res.status(400).json({msg: "password and confirm password not match"});
        }

        if (existUser) {
            console.log("user already exist", existUser.name)
            return res.status(400).json({msg: "user already exist"})
        }


        const hashedPassword = await bcrypt.hash(password, 10);
        let newAdmin = new SuperAdminModel({
            name,
            email,
            mobile,
            password: hashedPassword,
        })

        await newAdmin.save();

        
    } catch (error) {
        console.log("Error in /signup post",error);
        res.status(500).json({msg: "Ooops!, Something went wrong !"})
    }
})


router.post("/api/verify", async (req, res) => {
    try {
      const { email } = req.body;
      console.log("Email received:", email);
      
      let admin = await SuperAdminModel.findOne({email})
      if (admin) {
        return res.status(400).json({msg:"Ooops! Something went wrong!"})
      }
  
      console.log("User lookup result:", user);
      if (user) {
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
      
      const isSent = await sendMail('karanghorse91@gmail.com', mailMsg, subject);
      if (!isSent) {
        return res.status(500).json({ msg: "Failed to send OTP. Please try again." });
    }
      req.session.otp = otpCode;

      console.warn("mail sent successfully !",isSent);
      console.log(otpCode);
      res.json({ msg: "mail sent successfully !" });
    } catch (err) {
      console.log("error in /api/verify :- ", err);
      res.status(500).json({ msg: "Server error occurred. Please try again later." }); // Add this line to send a response
    }
  });
  
  router.post('/api/otp/verify', (req, res) => {
    try {
      let otp = req.session.otp;
      delete req.session.otp
      let { reqOtp } = req.body;
      console.log(otp, reqOtp);

      if (reqOtp === otp) {
        return res.status(200).json({ msg: 'Email verification successfully' })
      } else {
        return res.status(403).json({ msg: 'OTP verification failed' })
      }

    } catch (err) {
      console.log("Error in /api/otp/verify", err);
      res.status(500).json({ msg: "Server error occurred during OTP verification." });
    }
  })
  
module.exports = router;
