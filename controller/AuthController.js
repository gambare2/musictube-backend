const bcrypt = require('bcrypt');
const UserModal = require('../db/User');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    console.log("[Register] req.body:", req.body);
    console.log("[Register] req.file:", req.file?.originalname);

    const { name, email, password, username, DOB } = req.body;
    const profileBuffer = req.file?.buffer;

    const userExists = await UserModal.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        message: "User already exists, you can login",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModal({
      name,
      email,
      password: hashedPassword,
      username,
      DOB,
      profile: profileBuffer
        ? `data:${req.file.mimetype};base64,${profileBuffer.toString('base64')}`
        : undefined,
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      success: true,
    });
  } catch (error) {
    console.error('[Register] Error:', error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};



const login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    const errorMessage = "Invalid email/username or password";

    const user = await UserModal.findOne({
      $or: [
        { email: usernameOrEmail },
        { name: usernameOrEmail }
      ]
    });

    if (!user) {
      return res.status(403).json({
        message: errorMessage,
        success: false,
      });
    }

    const isPassValid = await bcrypt.compare(password, user.password);
    if (!isPassValid) {
      return res.status(403).json({
        message: errorMessage,
        success: false,
      });
    }

    const jwtToken = jwt.sign(
      {
        email: user.email,
        name: user.name,
        id: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful",
      success: true,
      token: jwtToken,
      email: user.email,
      name: user.name,
      id: user._id,
    });
  } catch (error) {
    console.error("[login] Error:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};


  
module.exports = {
  register,
  login
};
