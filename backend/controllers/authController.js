const User = require("../models/User");
const GymSubscription = require("../models/GymSubscription");
const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (user, rememberMe = false) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      gym: user.gym?._id || user.gym || null,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: rememberMe ? "30d" : "1d",
    },
  );
};

// Register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "member",
    });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        gym: user.gym || null,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gym: user.gym || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).populate(
      "gym",
      "name email phone address ownerName ownerEmail status",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    let subscription = null;

    // Gym Admin subscription access check
    if (user.role === "admin") {
      if (!user.gym) {
        return res.status(403).json({
          success: false,
          message: "No gym is assigned to this admin account",
        });
      }

      if (user.gym.status !== "active") {
        return res.status(403).json({
          success: false,
          message:
            "Your gym has been deactivated by the main administrator",
          gymInactive: true,
        });
      }

      subscription = await GymSubscription.findOne({
        gym: user.gym._id,
        status: "active",
      })
        .populate(
          "plan",
          "name description duration durationUnit price features maxMembers maxTrainers",
        )
        .sort({ endDate: -1 });

      if (!subscription) {
        return res.status(403).json({
          success: false,
          message:
            "Your gym does not have an active Gymora subscription",
          subscriptionRequired: true,
        });
      }

      const now = new Date();

      if (subscription.endDate <= now) {
        subscription.status = "expired";
        await subscription.save();

        return res.status(403).json({
          success: false,
          message: "Your Gymora subscription has expired",
          subscriptionExpired: true,
          endDate: subscription.endDate,
        });
      }
    }

    // Remember Me controls JWT expiry
    const token = generateToken(user, rememberMe);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      rememberMe,
      expiresIn: rememberMe ? "30d" : "1d",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gym: user.gym
          ? {
              id: user.gym._id,
              name: user.gym.name,
              email: user.gym.email,
              phone: user.gym.phone,
              address: user.gym.address,
              status: user.gym.status,
            }
          : null,
      },

      subscription: subscription
        ? {
            id: subscription._id,
            plan: subscription.plan,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            amount: subscription.amount,
            paymentStatus: subscription.paymentStatus,
            status: subscription.status,
            transactionId: subscription.transactionId,
          }
        : null,
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get logged-in user profile
const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
};