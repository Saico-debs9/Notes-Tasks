const { Users } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    console.log("➡️ Incoming Google login request body:", req.body);

    const { tokenId } = req.body;

    if (!tokenId) {
      console.error("❌ No tokenId received in request");
      return res.status(400).json({ error: "Missing tokenId" });
    }

    console.log("🔑 Verifying token with Google...");

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log("✅ Google token verified, payload:", payload);
    console.log("Frontend token audience:", payload.aud);
    console.log("Backend expected audience:", process.env.GOOGLE_CLIENT_ID);

    const { email, sub: googleId, name } = payload;

    if (!email) {
      console.error("❌ No email returned from Google");
      return res.status(400).json({ error: "No email from Google" });
    }

    // 🔎 Check if user already exists
    let user = await User.findOne({ where: { email } });

    if (!user) {
      console.log("👤 No user found, creating new one...");
      user = await User.create({
        username: email,
        googleId,
        name,
        password: null,
      });
    } else {
      console.log("👤 Existing user found:", user.email);
    }
    const token = jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: "30m" }
);
    res.json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("❌ Error in googleLogin:", err.message);
    res.status(400).json({ error: "Google login failed", details: err.message });
  }
};

exports.signup = async (req, res) => {
  console.log("Received body:", req.body);
 
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await Users.create({ username, password: hashed });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Users.findOne({ where: { username } });
    if (!user) return res.status(400).json({ error: "Invalid username" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET,
      {expiresIn: '30m'}

    );
    res.json({ token });
  } catch (err) {
    console.error(err); // 🔴 LOG the error
    res.status(500).json({ error: "Server error" });
  }
};

