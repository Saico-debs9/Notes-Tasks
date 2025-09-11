const { Users } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();


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

