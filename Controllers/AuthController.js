const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ REGISTER FUNCTION — Admin Only
exports.register = async (req, res) => {
  try {
    const adminUser = req.user; // ✅ From verifyToken middleware

    // ✅ Allow only if user is admin
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Only admin can register users.' });
    }

    const { name, email, password, businessName, gstin } = req.body;

    // ✅ Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      businessName,
      gstin,
      role: 'user', // Default role
    });

    await newUser.save();

    console.log(`✅ [Admin: ${adminUser.email}] registered user: ${email}`);
    return res.status(201).json({ message: 'User registered successfully.' });

  } catch (err) {
    console.error('❌ Registration Error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
};

// ✅ LOGIN FUNCTION — All Users
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    

    // ✅ Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email.' });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    // ✅ Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '2d' }
    );

    console.log(`✅ Login success: ${email} (${user.role})`);

    return res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        gstin: user.gstin
      }
    });

  } catch (err) {
    console.error('❌ Login Error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
};
