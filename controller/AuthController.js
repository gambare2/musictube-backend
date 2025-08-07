const bcrypt = require('bcrypt');
const UserModal = require('../db/User');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    // Check if user already exists
    const existingUser = await UserModal.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password ✅
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModal({
      name,
      email,
      username,
      password: hashedPassword, 
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully", success: true });
  } catch (error) {
    console.error("[REGISTER ERROR]", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};




const login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    const errorMessage = "Invalid email/username or password";
    console.log('[LOGIN ATTEMPT]', { usernameOrEmail, password });

    const user = await UserModal.findOne({
      $or: [
        { email: usernameOrEmail },
        { username: usernameOrEmail }
      ]
    });
    
    if (!user) {
      console.log("[LOGIN ERROR] User not found:", usernameOrEmail);
      return res.status(403).json({ message: errorMessage, success: false });
    }
    
    const isPassValid = await bcrypt.compare(password, user.password);
    console.log("[LOGIN DEBUG] Password match:", isPassValid);
    
    if (!isPassValid) {
      console.log("[LOGIN ERROR] Incorrect password for user:", usernameOrEmail);
      return res.status(403).json({ message: errorMessage, success: false });
    }
    

    const jwtToken = jwt.sign(
      { email: user.email, name: user.name, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: false, 
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    console.log('[LOGIN SUCCESS]', user.email);
    res.status(200).json({
      message: "Login successful",
      token: jwtToken,
      email: user.email,
      name: user.name,
      id: user._id,
    });
  } catch (error) {
    console.error('[LOGIN EXCEPTION]', error);
    res.status(500).json({ message: "Internal server error" });
  }
};  
module.exports = {
  register,
  login
};
