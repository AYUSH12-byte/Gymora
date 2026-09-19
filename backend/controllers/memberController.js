const User = require("../models/User");
const Member = require("../models/Member");
const crypto = require("crypto");
const QRCode = require("qrcode");
const Notification = require("../models/Notification");

// Create member
const createMember = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      gender,
      dateOfBirth,
      emergencyContact,
    } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and phone are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Create user account
    const user = await User.create({
      name,
      email,
      password,
      role: "member",
    });

    // Generate QR token
    const qrToken = crypto.randomBytes(16).toString("hex");

    // Create member profile
    const member = await Member.create({
      user: user._id,
      phone,
      address,
      gender,
      dateOfBirth,
      emergencyContact,
      qrToken,
    });

    // Create admin notification
    if (req.user?._id) {
      await Notification.create({
        user: req.user._id,
        type: "new_member",
        title: "New Member Added",
        message: `${name} has been added as a new member.`,
        relatedId: member._id,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Member created successfully",
      member,
    });
  } catch (error) {
    console.error("Create member error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all members
const getMembers = async (req, res) => {
  try {
    const members = await Member.find()
      .populate("user", "name email role isActive")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    console.error("Get members error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single member
const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Getting member by ID:", id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Member ID is required",
      });
    }

    const member = await Member.findById(id).populate(
      "user",
      "name email role isActive",
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    return res.status(200).json({
      success: true,
      member,
    });
  } catch (error) {
    console.error("Get member by ID error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get member QR
const getMemberQR = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Member ID is required",
      });
    }

    const member = await Member.findById(id).populate(
      "user",
      "name email role isActive",
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    // Generate QR token if missing
    if (!member.qrToken) {
      member.qrToken = crypto.randomBytes(32).toString("hex");

      await member.save();
    }

    // Data stored inside QR
    const qrData = JSON.stringify({
      type: "GYM_MEMBER",
      memberId: member._id.toString(),
      token: member.qrToken,
    });

    // Generate QR image
    const qrCode = await QRCode.toDataURL(qrData);

    return res.status(200).json({
      success: true,
      message: "Member QR generated successfully",

      qr: {
        type: "GYM_MEMBER",
        memberId: member._id.toString(),
        token: member.qrToken,
        data: qrData,
        image: qrCode,
      },

      member: {
        id: member._id,
        name: member.user?.name || "Member",
        email: member.user?.email || "",
        phone: member.phone || "",
        status: member.status || "active",
      },
    });
  } catch (error) {
    console.error("Get member QR error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate member QR",
    });
  }
};

// Delete member
const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Member ID is required",
      });
    }

    // Find member
    const member = await Member.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    // Delete member profile
    await Member.findByIdAndDelete(id);

    // Delete associated user account
    if (member.user) {
      await User.findByIdAndDelete(member.user);
    }

    return res.status(200).json({
      success: true,
      message: "Member deleted successfully",
    });
  } catch (error) {
    console.error("Delete member error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createMember,
  getMembers,
  getMemberById,
  getMemberQR,
  deleteMember,
};