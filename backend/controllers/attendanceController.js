const Attendance = require("../models/Attendance");
const Member = require("../models/Member");

// Check in member
const checkIn = async (req, res) => {
  try {
    const { memberId, method, notes } = req.body;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "Member ID is required",
      });
    }

    const member = await Member.findById(memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    if (member.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Member account is inactive",
      });
    }

    // Check if already checked in today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = await Attendance.findOne({
      member: memberId,
      checkIn: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      checkOut: null,
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "Member is already checked in",
        attendance: existingAttendance,
      });
    }

    const attendance = await Attendance.create({
      member: memberId,
      method: method || "manual",
      notes: notes || "",
    });

    const populatedAttendance = await Attendance.findById(
      attendance._id,
    ).populate({
      path: "member",
      populate: {
        path: "user",
        select: "name email",
      },
    });

    res.status(201).json({
      success: true,
      message: "Member checked in successfully",
      attendance: populatedAttendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check out member
const checkOut = async (req, res) => {
  try {
    const { attendanceId } = req.body;

    if (!attendanceId) {
      return res.status(400).json({
        success: false,
        message: "Attendance ID is required",
      });
    }

    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: "Member has already checked out",
      });
    }

    attendance.checkOut = new Date();
    attendance.status = "completed";

    await attendance.save();

    const populatedAttendance = await Attendance.findById(
      attendance._id,
    ).populate({
      path: "member",
      populate: {
        path: "user",
        select: "name email",
      },
    });

    res.status(200).json({
      success: true,
      message: "Member checked out successfully",
      attendance: populatedAttendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all attendance
const getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate({
        path: "member",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ checkIn: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get today's attendance
const getTodayAttendance = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      checkIn: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate({
        path: "member",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ checkIn: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get member attendance history
const getMemberAttendance = async (req, res) => {
  try {
    const member = await Member.findById(req.params.memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const attendance = await Attendance.find({
      member: member._id,
    }).sort({ checkIn: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get attendance by ID
const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id).populate({
      path: "member",
      populate: {
        path: "user",
        select: "name email",
      },
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getAttendance,
  getTodayAttendance,
  getMemberAttendance,
  getAttendanceById,
};
