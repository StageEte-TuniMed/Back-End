// User service layer
// TODO: Business logic for user operations
// TODO: User data processing
// TODO: User validation business rules
// TODO: User relationship management
// TODO: User statistics and analytics

const bcrypt = require("bcrypt");
const User = require("../models/User");

// **Get All Users**
const getUsers = async () => {
  try {
    return await User.find();
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Get Users By Role**
const getUsersByRole = async (role) => {
  try {
    return await User.find({ role });
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Get User By ID**
const getUserById = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Create User**
const createUser = async (userData) => {
  try {
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }
    const user = new User(userData);
    return await user.save();
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Update User**
const updateUser = async (id, updateData) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser) throw new Error("User not found");
    return updatedUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Delete User**
const deleteUser = async (id) => {
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) throw new Error("User not found");
    return { message: "User deleted successfully" };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  getUsers,
  getUsersByRole,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
