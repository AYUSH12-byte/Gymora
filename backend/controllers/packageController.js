const MembershipPackage = require("../models/MembershipPackage");

// Create package
const createPackage = async (req, res) => {
  try {
    const { name, duration, durationUnit, price, discount, description } =
      req.body;

    if (!name || !duration || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, duration and price are required",
      });
    }

    const existingPackage = await MembershipPackage.findOne({
      name,
    });

    if (existingPackage) {
      return res.status(400).json({
        success: false,
        message: "Package already exists",
      });
    }

    const membershipPackage = await MembershipPackage.create({
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
    const packages = await MembershipPackage.find().sort({
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
    const packages = await MembershipPackage.find({
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
    const membershipPackage = await MembershipPackage.findById(req.params.id);

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
    const membershipPackage = await MembershipPackage.findByIdAndUpdate(
      req.params.id,
      req.body,
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
    const membershipPackage = await MembershipPackage.findByIdAndDelete(
      req.params.id,
    );

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
