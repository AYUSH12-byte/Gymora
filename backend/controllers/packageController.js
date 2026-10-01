const MembershipPackage = require("../models/MembershipPackage");

// Create package
const createPackage = async (req, res) => {
  try {
    const {
      name,
      duration,
      durationUnit,
      price,
      discount,
      description,
    } = req.body;

    if (!req.user?.gym) {
      return res.status(403).json({
        success: false,
        message: "No gym is assigned to this account",
      });
    }

    if (!name || !duration || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, duration and price are required",
      });
    }

    const existingPackage = await MembershipPackage.findOne({
      gym: req.user.gym,
      name,
    });

    if (existingPackage) {
      return res.status(400).json({
        success: false,
        message: "Package already exists in your gym",
      });
    }

    const membershipPackage = await MembershipPackage.create({
      gym: req.user.gym,
      name,
      duration,
      durationUnit,
      price,
      discount,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Membership package created successfully",
      package: membershipPackage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all packages
const getPackages = async (req, res) => {
  try {
    if (!req.user?.gym) {
      return res.status(403).json({
        success: false,
        message: "No gym is assigned to this account",
      });
    }

    const packages = await MembershipPackage.find({
      gym: req.user.gym,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: packages.length,
      packages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get active packages
const getActivePackages = async (req, res) => {
  try {
    if (!req.user?.gym) {
      return res.status(403).json({
        success: false,
        message: "No gym is assigned to this account",
      });
    }

    const packages = await MembershipPackage.find({
      gym: req.user.gym,
      isActive: true,
    }).sort({
      price: 1,
    });

    res.status(200).json({
      success: true,
      count: packages.length,
      packages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single package
const getPackageById = async (req, res) => {
  try {
    if (!req.user?.gym) {
      return res.status(403).json({
        success: false,
        message: "No gym is assigned to this account",
      });
    }

    const membershipPackage = await MembershipPackage.findOne({
      _id: req.params.id,
      gym: req.user.gym,
    });

    if (!membershipPackage) {
      return res.status(404).json({
        success: false,
        message: "Membership package not found",
      });
    }

    res.status(200).json({
      success: true,
      package: membershipPackage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update package
const updatePackage = async (req, res) => {
  try {
    if (!req.user?.gym) {
      return res.status(403).json({
        success: false,
        message: "No gym is assigned to this account",
      });
    }

    const membershipPackage =
      await MembershipPackage.findOneAndUpdate(
        {
          _id: req.params.id,
          gym: req.user.gym,
        },
        {
          $set: {
            ...req.body,
            gym: req.user.gym,
          },
        },
        {
          new: true,
          runValidators: true,
        },
      );

    if (!membershipPackage) {
      return res.status(404).json({
        success: false,
        message: "Membership package not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Membership package updated successfully",
      package: membershipPackage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete package
const deletePackage = async (req, res) => {
  try {
    if (!req.user?.gym) {
      return res.status(403).json({
        success: false,
        message: "No gym is assigned to this account",
      });
    }

    const membershipPackage =
      await MembershipPackage.findOneAndDelete({
        _id: req.params.id,
        gym: req.user.gym,
      });

    if (!membershipPackage) {
      return res.status(404).json({
        success: false,
        message: "Membership package not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Membership package deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPackage,
  getPackages,
  getActivePackages,
  getPackageById,
  updatePackage,
  deletePackage,
};