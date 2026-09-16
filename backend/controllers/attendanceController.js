const Membership = require("../models/Membership");
const Attendance = require("../models/Attendance");
const Member = require("../models/Member");

// CHECK IN MEMBER - MANUAL
const checkIn = async (req, res) => {
  try {
    const { memberId, method, notes } = req.body;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "Member ID is required",
      });
    }

    // Find member
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

    // Check member status
    if (member.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Member account is inactive",
      });
    }

    // Check active membership
    const activeMembership = await Membership.findOne({
      member: member._id,
      status: "active",
      endDate: { $gt: new Date() },
    }).populate("package", "name duration durationUnit");

    if (!activeMembership) {
      return res.status(400).json({
        success: false,
        message: "Member does not have an active membership",
      });
    }

    // Start of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // End of today
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      member: member._id,
      checkIn: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      checkOut: null,
    }).sort({ checkIn: -1 });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "Member is already checked in",
        attendance: existingAttendance,
      });
    }

    // Create attendance
    const attendance = await Attendance.create({
      member: member._id,
      date: new Date(),
      checkIn: new Date(),
      status: "present",
      method: method || "manual",
      notes: notes || "",
    });

    // Populate attendance
    const populatedAttendance = await Attendance.findById(
      attendance._id
    ).populate({
      path: "member",
      populate: {
        path: "user",
        select: "name email",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Member checked in successfully",
      attendance: populatedAttendance,
      membership: {
        id: activeMembership._id,
        package: activeMembership.package?.name,
        startDate: activeMembership.startDate,
        endDate: activeMembership.endDate,
      },
      checkInTime: attendance.checkIn,
    });
  } catch (error) {
    console.error("Manual Check-in Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// CHECK OUT MEMBER - MANUAL
const checkOut = async (req, res) => {
  try {
    const { attendanceId } = req.body;

    if (!attendanceId) {
      return res.status(400).json({
        success: false,
        message: "Attendance ID is required",
      });
    }

    // Find attendance
    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    // Already checked out
    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: "Member has already checked out",
      });
    }

    // Check out
    attendance.checkOut = new Date();
    attendance.status = "completed";

    await attendance.save();

    // Calculate duration
    const durationMs = attendance.checkOut - attendance.checkIn;
    const durationMinutes = Math.floor(
      durationMs / (1000 * 60)
    );

    // Populate member
    const populatedAttendance = await Attendance.findById(
      attendance._id
    ).populate({
      path: "member",
      populate: {
        path: "user",
        select: "name email",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Member checked out successfully",
      attendance: populatedAttendance,
      durationMinutes,
      checkOutTime: attendance.checkOut,
    });
  } catch (error) {
    console.error("Manual Check-out Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL ATTENDANCE
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

    return res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error("Get Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET TODAY'S ATTENDANCE
const getTodayAttendance = async (req, res) => {
  try {
    const now = new Date();

    // Start of today
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // End of today
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    console.log("Today's Attendance Date Range:");
    console.log("Start:", startOfDay);
    console.log("End:", endOfDay);

    const attendance = await Attendance.find({
      date: {
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
      .sort({
        checkIn: -1,
      });

    console.log(
      "Today's Attendance Count:",
      attendance.length
    );

    console.log(
      "Today's Attendance:",
      attendance
    );

    return res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error(
      "Get Today's Attendance Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET MEMBER ATTENDANCE HISTORY
const getMemberAttendance = async (req, res) => {
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

    const attendance = await Attendance.find({
      member: member._id,
    }).sort({ checkIn: -1 });

    return res.status(200).json({
      success: true,
      member: {
        id: member._id,
        name: member.user?.name,
        email: member.user?.email,
      },
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error("Get Member Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// GET ATTENDANCE BY ID
const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(
      req.params.id
    ).populate({
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

    return res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error("Get Attendance By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// QR CHECK IN
const checkInByQR = async (req, res) => {
  try {
    const { memberId, token } = req.body;

    if (!memberId || !token) {
      return res.status(400).json({
        success: false,
        message: "Member ID and QR token are required",
      });
    }

    // Find member
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

    // Validate QR token
    if (!member.qrToken || member.qrToken !== token) {
      return res.status(401).json({
        success: false,
        message: "Invalid QR code",
      });
    }

    // Check member status
    if (member.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Member account is inactive",
      });
    }

    // Check active membership
    const activeMembership = await Membership.findOne({
      member: member._id,
      status: "active",
      endDate: { $gt: new Date() },
    }).populate("package", "name duration durationUnit");

    if (!activeMembership) {
      return res.status(400).json({
        success: false,
        message: "Member does not have an active membership",
      });
    }

    // Start of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // End of today
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Check today's active attendance
    const existingAttendance = await Attendance.findOne({
      member: member._id,
      checkIn: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: "present",
      checkOut: null,
    }).sort({ checkIn: -1 });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "Member is already checked in today",
        attendance: existingAttendance,
      });
    }

    // Create QR attendance
    const attendance = await Attendance.create({
      member: member._id,
      date: new Date(),
      checkIn: new Date(),
      status: "present",
      method: "qr",
    });

    // Populate attendance
    const populatedAttendance = await Attendance.findById(
      attendance._id
    ).populate({
      path: "member",
      populate: {
        path: "user",
        select: "name email",
      },
    });

    return res.status(201).json({
      success: true,
      message: "QR check-in successful",
      attendance: populatedAttendance,
      member: {
        id: member._id,
        name: member.user?.name,
        email: member.user?.email,
      },
      membership: {
        id: activeMembership._id,
        package: activeMembership.package?.name,
        startDate: activeMembership.startDate,
        endDate: activeMembership.endDate,
      },
      checkInTime: attendance.checkIn,
    });
  } catch (error) {
    console.error("QR Check-in Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// QR CHECK OUT
const checkOutByQR = async (req, res) => {
  try {
    const { memberId, token } = req.body;

    if (!memberId || !token) {
      return res.status(400).json({
        success: false,
        message: "Member ID and QR token are required",
      });
    }

    // Find member
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

    // Validate QR token
    if (!member.qrToken || member.qrToken !== token) {
      return res.status(401).json({
        success: false,
        message: "Invalid QR code",
      });
    }

    // Check member status
    if (member.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Member account is inactive",
      });
    }

    // Find active attendance for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await Attendance.findOne({
      member: member._id,
      checkIn: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: "present",
      checkOut: null,
    }).sort({ checkIn: -1 });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "No active check-in found for today",
      });
    }

    // Check out
    attendance.checkOut = new Date();
    attendance.status = "completed";

    await attendance.save();

    // Calculate duration
    const durationMs =
      attendance.checkOut - attendance.checkIn;

    const durationMinutes = Math.floor(
      durationMs / (1000 * 60)
    );

    // Populate updated attendance
    const populatedAttendance = await Attendance.findById(
      attendance._id
    ).populate({
      path: "member",
      populate: {
        path: "user",
        select: "name email",
      },
    });

    return res.status(200).json({
      success: true,
      message: "QR check-out successful",
      attendance: populatedAttendance,
      member: {
        id: member._id,
        name: member.user?.name,
        email: member.user?.email,
      },
      checkOutTime: attendance.checkOut,
      durationMinutes,
    });
  } catch (error) {
    console.error("QR Check-out Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// EXPORTS
module.exports = {
  checkIn,
  checkInByQR,
  checkOut,
  checkOutByQR,
  getAttendance,
  getTodayAttendance,
  getMemberAttendance,
  getAttendanceById,
};