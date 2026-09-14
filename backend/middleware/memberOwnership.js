const Member = require("../models/Member");

const checkMemberOwnership = async (req, res, next) => {
  try {
    if (req.user.role !== "member") {
      return next();
    }

    const member = await Member.findOne({
      _id: req.params.memberId,
      user: req.user._id,
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only access your own data",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = checkMemberOwnership;
