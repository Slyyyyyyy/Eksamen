const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const errorResponse = (status, message) => ({
  status: 'error',
  code: status,
  message
});

const successResponse = (data, links = {}) => ({
  status: 'success',
  data,
  _links: links
});

exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json(errorResponse(400, 'Invalid credentials'));

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json(errorResponse(400, 'Invalid credentials'));

    const token = jwt.sign(
      { username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1h' }
    );

    res.json(successResponse({ token }));
  } catch (err) {
    res.status(500).json(errorResponse(500, 'Server error'));
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ message: 'Username or email already exists' });

    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.registerAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ message: 'Username or email already exists' });

    const admin = new User({
      username,
      email,
      password,
      role: 'admin'
    });
    
    await admin.save();
    res.status(201).json({ message: 'Admin user created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) return res.status(404).json(errorResponse(404, 'User not found'));

    res.json(successResponse({
      user: {
        ...user.toJSON(),
        _links: {
          self: `/api/v1/users/${user.username}`,
          update: `/api/v1/users/${user.username}`,
          delete: `/api/v1/users/${user.username}`
        }
      }
    }));
  } catch (err) {
    res.status(500).json(errorResponse(500, 'Server error'));
  }
};

exports.getAllUsernames = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find({}, 'username role')
      .skip(skip)
      .limit(limit);

    const userList = users.map(user => ({
      username: user.username,
      role: user.role,
      _links: {
        self: `/api/v1/users/${user.username}`,
        update: `/api/v1/users/${user.username}`,
        delete: `/api/v1/users/${user.username}`
      }
    }));

    res.json(successResponse({
      users: userList,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    }));
  } catch (err) {
    res.status(500).json(errorResponse(500, 'Server error'));
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) delete updates.password;

    const updatedUser = await User.findOneAndUpdate(
      { username: req.params.username },
      updates,
      { new: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const result = await User.findOneAndDelete({ username: req.params.username });
    if (!result) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
