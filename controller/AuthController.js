const bcrypt = require('bcrypt');
const UserModal = require('../db/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const register = async (req, res) => {
  try {
    const { name, email, password, username, DOB } = req.body;

    // Check if user already exists
    const existingUser = await UserModal.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists. Please login.",
        success: false,
        redirectToLogin: true
      });
    }

    // Hash the password ✅
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Handle Profile image - check if uploaded file exists, else use base64 in body, else default
    let profilePic = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
    if (req.file) {
      profilePic = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    } else if (req.body.profile) {
      profilePic = req.body.profile;
    }

    const newUser = new UserModal({
      name,
      email,
      username,
      password: hashedPassword,
      DOB: DOB ? new Date(DOB) : undefined,
      profile: profilePic
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      success: true
    });
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
      profile: user.profile,
      username: user.username
    });
  } catch (error) {
    console.error('[LOGIN EXCEPTION]', error);
    res.status(500).json({ message: "Internal server error" });
  }
};  

const getProfile = async (req, res) => {
  try {
    const user = await UserModal.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("[PROFILE ERROR]", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Forgot Password Request
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await UserModal.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No user with that email address exists." });
    }

    // Generate numeric 6-digit pin for ease of use in resetting password
    const resetPin = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.resetPasswordToken = resetPin;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    console.log(`[PASSWORD RESET PIN FOR ${email}]: ${resetPin}`);

    res.status(200).json({
      message: "Password reset pin generated. In a production app this would be emailed. For testing, your pin has been printed to the server terminal output.",
      pin: resetPin, // Send back so frontend can pre-fill or show it to make the forgot password flow fully functional for the user!
      success: true
    });
  } catch (err) {
    console.error('[FORGOT PASSWORD EXCEPTION]', err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reset Password Execution
const resetPassword = async (req, res) => {
  try {
    const { email, pin, newPassword } = req.body;
    if (!email || !pin || !newPassword) {
      return res.status(400).json({ message: "Email, pin, and newPassword are required" });
    }

    const user = await UserModal.findOne({
      email,
      resetPasswordToken: pin,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Password reset pin is invalid or has expired." });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Clear reset tokens
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      message: "Your password has been successfully updated.",
      success: true
    });
  } catch (err) {
    console.error('[RESET PASSWORD EXCEPTION]', err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword
};
