const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");

const sanitizeUser = (user) => {
  const userObject = user.toObject ? user.toObject() : user;
  delete userObject.password;
  return userObject;
};

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email, and password are required",
    });
  }

  const allowedRoles = ["admin", "student"];
  const safeRole = allowedRoles.includes(role) ? role : "student";

  const exists = await User.findOne({ email }).select("_id").lean();

  if (exists) {
    return res.status(400).json({
      message: "Email already exists",
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: safeRole,
  });

  const cleanUser = sanitizeUser(user);

  res.status(201).json({
    user: cleanUser,
    token: generateToken(user),
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const cleanUser = sanitizeUser(user);

  res.json({
    user: cleanUser,
    token: generateToken(user),
  });
});

exports.me = asyncHandler(async (req, res) => {
  res.json(req.user);
});
