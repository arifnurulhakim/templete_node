const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Create a Nodemailer transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false, // Set it to true if using TLS
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

// Fungsi untuk menghasilkan kode acak
const generateVerificationCode = () => {
  return Math.floor(10000 + Math.random() * 90000);
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Mengenkripsi password menggunakan bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword });

    // Menghasilkan kode verifikasi acak
    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;

    await user.save();

    // Mengirim email verifikasi
    const mailOptions = {
      from: process.env.MAIL_FROM_ADDRESS,
      to: email,
      subject: 'Verify Your Email',
      html: `
        <h2>Hi ${name},</h2>
        <p>Thank you for registering. Please use the following verification code to verify your email:</p>
        <h3>${verificationCode}</h3>
      `,
    };
    await transporter.sendMail(mailOptions);

    res.status(201).json({
      status: 'success',
      message: 'User created successfully. Please check your email to verify your account.',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Email verification successful. You can now login to your account.',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Membandingkan password yang diinputkan dengan password yang sudah dienkripsi
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      user: user,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUser = async (req, res) => {
    try {
      const userId = req.userId;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};
