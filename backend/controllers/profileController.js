const User = require("../models/User");
const Member = require("../models/Member");

// Get logged-in user's profile
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let memberProfile = null;

    if (user.role === "member") {
      memberProfile = await Member.findOne({
        user: user._id,
      });
    }

    res.status(200).json({
      success: true,
      profile: {
        user,
        member: memberProfile,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update logged-in user's profile
const updateMyProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      gender,
      dateOfBirth,
      emergencyContact,
      profileImage,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) {
      user.name = name;
    }

    await user.save();

    if (user.role === "member") {
      const member = await Member.findOne({
        user: user._id,
      });

      if (member) {
        if (phone !== undefined) member.phone = phone;
        if (address !== undefined) member.address = address;
        if (gender !== undefined) member.gender = gender;
        if (dateOfBirth !== undefined) {
          member.dateOfBirth = dateOfBirth;
        }

        if (emergencyContact !== undefined) {
          member.emergencyContact = emergencyContact;
        }

        if (profileImage !== undefined) {
          member.profileImage = profileImage;
        }

        await member.save();
      }
    }

    const updatedUser = await User.findById(user._id).select("-password");

    const updatedMember =
      user.role === "member" ? await Member.findOne({ user: user._id }) : null;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        user: updatedUser,
        member: updatedMember,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  changePassword,
};
