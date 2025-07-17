const DoctorProfile = require("../models/DoctorProfile");
const User = require("../models/User");

// **Get Doctor Profile by Doctor ID**
const getDoctorProfile = async (doctorId) => {
  try {
    const profile = await DoctorProfile.findOne({ doctorId }).populate(
      "doctor",
      "-passwordHash"
    );
    return profile;
  } catch (error) {
    throw new Error("Error fetching doctor profile: " + error.message);
  }
};

// **Get All Doctor Profiles**
const getAllDoctorProfiles = async () => {
  try {
    const profiles = await DoctorProfile.find().populate(
      "doctor",
      "-passwordHash"
    );
    return profiles;
  } catch (error) {
    throw new Error("Error fetching doctor profiles: " + error.message);
  }
};

// **Get Doctor Profiles with filters**
const getDoctorProfiles = async (filters = {}) => {
  try {
    let query = {};

    // Add filters
    if (filters.profileCompleted !== undefined) {
      query.profileCompleted = filters.profileCompleted;
    }

    if (filters.acceptsEmergencies !== undefined) {
      query.acceptsEmergencies = filters.acceptsEmergencies;
    }

    if (filters.services && filters.services.length > 0) {
      query.services = { $in: filters.services };
    }

    if (filters.specializations && filters.specializations.length > 0) {
      query.specializations = { $in: filters.specializations };
    }

    const profiles = await DoctorProfile.find(query).populate(
      "doctor",
      "-passwordHash"
    );
    return profiles;
  } catch (error) {
    throw new Error("Error fetching doctor profiles: " + error.message);
  }
};

// **Create Doctor Profile**
const createDoctorProfile = async (profileData) => {
  try {
    // Check if doctor exists and is actually a doctor
    const doctor = await User.findById(profileData.doctorId);
    if (!doctor) {
      throw new Error("Doctor not found");
    }
    if (doctor.role !== "DOCTOR") {
      throw new Error("User is not a doctor");
    }

    // Check if profile already exists
    const existingProfile = await DoctorProfile.findOne({
      doctorId: profileData.doctorId,
    });
    if (existingProfile) {
      throw new Error("Doctor profile already exists");
    }

    const profile = new DoctorProfile(profileData);
    await profile.save();

    // Populate the doctor information
    await profile.populate("doctor", "-passwordHash");

    return profile;
  } catch (error) {
    throw new Error("Error creating doctor profile: " + error.message);
  }
};

// **Update Doctor Profile**
const updateDoctorProfile = async (doctorId, updateData) => {
  try {
    const profile = await DoctorProfile.findOneAndUpdate(
      { doctorId },
      updateData,
      { new: true, runValidators: true }
    ).populate("doctor", "-passwordHash");

    if (!profile) {
      throw new Error("Doctor profile not found");
    }

    return profile;
  } catch (error) {
    throw new Error("Error updating doctor profile: " + error.message);
  }
};

// **Complete Doctor Profile**
const completeDoctorProfile = async (doctorId, profileData) => {
  try {
    // Check if profile exists, create if not
    let profile = await DoctorProfile.findOne({ doctorId });

    if (!profile) {
      // Create new profile if doesn't exist
      profile = await createDoctorProfile({
        ...profileData,
        doctorId,
        profileCompleted: true,
        profileCompletedAt: new Date(),
      });
    } else {
      // Update existing profile
      profile = await DoctorProfile.findOneAndUpdate(
        { doctorId },
        {
          ...profileData,
          profileCompleted: true,
          profileCompletedAt: new Date(),
        },
        { new: true, runValidators: true }
      ).populate("doctor", "-passwordHash");
    }

    return profile;
  } catch (error) {
    throw new Error("Error completing doctor profile: " + error.message);
  }
};

// **Delete Doctor Profile**
const deleteDoctorProfile = async (doctorId) => {
  try {
    const profile = await DoctorProfile.findOneAndDelete({ doctorId });
    if (!profile) {
      throw new Error("Doctor profile not found");
    }
    return { message: "Doctor profile deleted successfully" };
  } catch (error) {
    throw new Error("Error deleting doctor profile: " + error.message);
  }
};

// **Search Doctor Profiles**
const searchDoctorProfiles = async (searchQuery) => {
  try {
    const query = {
      $or: [
        { bio: { $regex: searchQuery, $options: "i" } },
        { services: { $regex: searchQuery, $options: "i" } },
        { specializations: { $regex: searchQuery, $options: "i" } },
        { languages: { $regex: searchQuery, $options: "i" } },
      ],
    };

    const profiles = await DoctorProfile.find(query).populate(
      "doctor",
      "-passwordHash"
    );
    return profiles;
  } catch (error) {
    throw new Error("Error searching doctor profiles: " + error.message);
  }
};

// **Get Doctor Profiles by Location**
const getDoctorProfilesByLocation = async (lat, lng, radiusKm = 10) => {
  try {
    // Simple distance calculation (not precise for large distances)
    const profiles = await DoctorProfile.find({
      "coordinates.lat": {
        $gte: lat - radiusKm / 111, // Rough conversion: 1 degree ≈ 111 km
        $lte: lat + radiusKm / 111,
      },
      "coordinates.lng": {
        $gte: lng - radiusKm / (111 * Math.cos((lat * Math.PI) / 180)),
        $lte: lng + radiusKm / (111 * Math.cos((lat * Math.PI) / 180)),
      },
    }).populate("doctor", "-passwordHash");

    return profiles;
  } catch (error) {
    throw new Error(
      "Error fetching doctor profiles by location: " + error.message
    );
  }
};

module.exports = {
  getDoctorProfile,
  getAllDoctorProfiles,
  getDoctorProfiles,
  createDoctorProfile,
  updateDoctorProfile,
  completeDoctorProfile,
  deleteDoctorProfile,
  searchDoctorProfiles,
  getDoctorProfilesByLocation,
};
