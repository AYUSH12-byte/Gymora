const Gym = require("../models/Gym");

// Create Gym
const createGym = async (req, res) => {
  try {
    const { name, email, phone, address, logo, ownerName, ownerEmail } =
      req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Gym name and email are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingGym = await Gym.findOne({
      email: normalizedEmail,
      isDeleted: false,
    });

    if (existingGym) {
      return res.status(409).json({
        success: false,
        message: "A gym with this email already exists",
      });
    }

    const gym = await Gym.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone || "",
      address: address || "",
      logo: logo || "",
      ownerName: ownerName || "",
      ownerEmail: ownerEmail ? ownerEmail.toLowerCase().trim() : "",
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Gym created successfully",
      gym,
    });
  } catch (error) {
    console.error("Create Gym Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Gyms
const getGyms = async (req, res) => {
  try {
    const { search, status } = req.query;

    const filter = {
      isDeleted: false,
    };

    if (status && ["active", "inactive"].includes(status)) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          ownerName: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const gyms = await Gym.find(filter).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      count: gyms.length,
      gyms,
    });
  } catch (error) {
    console.error("Get Gyms Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Gym
const getGymById = async (req, res) => {
  try {
    const gym = await Gym.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).lean();

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: "Gym not found",
      });
    }

    return res.status(200).json({
      success: true,
      gym,
    });
  } catch (error) {
    console.error("Get Gym Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Gym
const updateGym = async (req, res) => {
  try {
    const gym = await Gym.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: "Gym not found",
      });
    }

    const { name, email, phone, address, logo, ownerName, ownerEmail } =
      req.body;

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();

      const duplicateGym = await Gym.findOne({
        email: normalizedEmail,
        _id: {
          $ne: gym._id,
        },
        isDeleted: false,
      });

      if (duplicateGym) {
        return res.status(409).json({
          success: false,
          message: "Another gym already uses this email",
        });
      }

      gym.email = normalizedEmail;
    }

    if (name !== undefined) {
      gym.name = name.trim();
    }

    if (phone !== undefined) {
      gym.phone = phone;
    }

    if (address !== undefined) {
      gym.address = address;
    }

    if (logo !== undefined) {
      gym.logo = logo;
    }

    if (ownerName !== undefined) {
      gym.ownerName = ownerName;
    }

    if (ownerEmail !== undefined) {
      gym.ownerEmail = ownerEmail ? ownerEmail.toLowerCase().trim() : "";
    }

    await gym.save();

    return res.status(200).json({
      success: true,
      message: "Gym updated successfully",
      gym,
    });
  } catch (error) {
    console.error("Update Gym Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Activate Gym
const activateGym = async (req, res) => {
  try {
    const gym = await Gym.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: "Gym not found",
      });
    }

    gym.status = "active";

    await gym.save();

    return res.status(200).json({
      success: true,
      message: "Gym activated successfully",
      gym,
    });
  } catch (error) {
    console.error("Activate Gym Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Deactivate Gym
const deactivateGym = async (req, res) => {
  try {
    const gym = await Gym.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: "Gym not found",
      });
    }

    gym.status = "inactive";

    await gym.save();

    return res.status(200).json({
      success: true,
      message: "Gym deactivated successfully",
      gym,
    });
  } catch (error) {
    console.error("Deactivate Gym Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Soft Delete Gym
const deleteGym = async (req, res) => {
  try {
    const gym = await Gym.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: "Gym not found",
      });
    }

    gym.isDeleted = true;
    gym.status = "inactive";

    await gym.save();

    return res.status(200).json({
      success: true,
      message: "Gym deleted successfully",
    });
  } catch (error) {
    console.error("Delete Gym Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createGym,
  getGyms,
  getGymById,
  updateGym,
  activateGym,
  deactivateGym,
  deleteGym,
};
