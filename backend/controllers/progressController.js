const Progress = require("../models/Progress");
const Member = require("../models/Member");

const createProgress = async (req, res) => {
  try {
    const {
      memberId,
      recordedAt,
      weight,
      bodyFat,
      chest,
      waist,
      arms,
      thighs,
      notes,
    } = req.body;

    if (!memberId || weight === undefined) {
      return res.status(400).json({
        success: false,
        message: "Member and weight are required",
      });
    }

    const member = await Member.findById(memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const progress = await Progress.create({
      member: memberId,
      recordedAt: recordedAt || new Date(),
      weight,
      bodyFat,
      chest,
      waist,
      arms,
      thighs,
      notes,
    });

    const populatedProgress = await Progress.findById(progress._id)
      .populate({
        path: "member",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    res.status(201).json({
      success: true,
      message: "Progress recorded successfully",
      progress: populatedProgress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProgress = async (req, res) => {
  try {
    const progress = await Progress.find()
      .populate({
        path: "member",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({
        recordedAt: -1,
      });

    res.status(200).json({
      success: true,
      count: progress.length,
      progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMemberProgress = async (req, res) => {
  try {
    const { memberId } = req.params;

    const member = await Member.findById(memberId).populate(
      "user",
      "name email"
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const progress = await Progress.find({
      member: memberId,
    }).sort({
      recordedAt: 1,
    });

    res.status(200).json({
      success: true,
      member,
      count: progress.length,
      progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProgressById = async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id).populate({
      path: "member",
      populate: {
        path: "user",
        select: "name email",
      },
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress record not found",
      });
    }

    res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProgress = async (req, res) => {
  try {
    const progress = await Progress.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate({
      path: "member",
      populate: {
        path: "user",
        select: "name email",
      },
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Progress updated successfully",
      progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteProgress = async (req, res) => {
  try {
    const progress = await Progress.findByIdAndDelete(req.params.id);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Progress deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProgress,
  getProgress,
  getMemberProgress,
  getProgressById,
  updateProgress,
  deleteProgress,
};