const jwt = require('jsonwebtoken');

const generateToken = async (user) => {
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      cid: user.cid,
      role: user.role
    };
  
    // Ensure that the environment variable is defined in your variable
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in the environment variable.");
    }
  
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '60d',
    });
  
    return token;
  };
const generateTokenForSuperAdmin = async (user) => {
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber,
    };
  
    // Ensure that the environment variable is defined in your variable
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in the environment variable.");
    }
  
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '60d',
    });
  
    return token;
  };
  

function authenticateSuperAdmin(req, res, next) {
  console.log("isAdminLoggedIn middilware");
  const token = req.cookies["360Followups"];

  if (!token || token === undefined) {
    return res.redirect("/wsv/super/login");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect("/wsv/super/login");
    }

    req.SuperAdmin = decoded;
    console.log("super Admin authenticated");
    return next();
  });
}
function authenticateUser(req, res, next) {
  console.log("isAdminLoggedIn middilware");
  const token = req.cookies["360Followups"];

  if (!token || token === undefined) {
    return res.redirect("/login");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect("/login");
    }

    req.user = decoded;
    // console.log(req.user);
    return next();
  });
}




module.exports = { generateToken, authenticateSuperAdmin, authenticateUser, generateTokenForSuperAdmin };