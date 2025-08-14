const Specialty = require("../models/Specialty");

const specialtyController = {
  // Get all specialties
  getAllSpecialties: async (req, res) => {
    try {
      const { category, search, active } = req.query;

      // Build query
      let query = {};

      // Filter by category if provided
      if (category && ["MAIN", "OTHER"].includes(category.toUpperCase())) {
        query.category = category.toUpperCase();
      }

      // Filter by active status if provided
      if (active !== undefined) {
        query.isActive = active === "true";
      }

      // Search by name if provided
      if (search) {
        query.name = { $regex: search, $options: "i" };
      }

      const specialties = await Specialty.find(query)
        .sort({ category: 1, sortOrder: 1, name: 1 })
        .select("name nameEn category sortOrder isActive");

      res.status(200).json({
        success: true,
        data: specialties,
        count: specialties.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching specialties",
        error: error.message,
      });
    }
  },

  // Get specialties grouped by category
  getSpecialtiesGrouped: async (req, res) => {
    try {
      const { active } = req.query;

      let query = {};
      if (active !== undefined) {
        query.isActive = active === "true";
      }

      const specialties = await Specialty.find(query)
        .sort({ category: 1, sortOrder: 1, name: 1 })
        .select("name nameEn category sortOrder isActive");

      // Group by category
      const grouped = {
        MAIN: specialties.filter((s) => s.category === "MAIN"),
        OTHER: specialties.filter((s) => s.category === "OTHER"),
      };

      res.status(200).json({
        success: true,
        data: grouped,
        count: {
          total: specialties.length,
          main: grouped.MAIN.length,
          other: grouped.OTHER.length,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching grouped specialties",
        error: error.message,
      });
    }
  },

  // Get a single specialty by ID
  getSpecialtyById: async (req, res) => {
    try {
      const { id } = req.params;

      const specialty = await Specialty.findById(id);

      if (!specialty) {
        return res.status(404).json({
          success: false,
          message: "Specialty not found",
        });
      }

      res.status(200).json({
        success: true,
        data: specialty,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching specialty",
        error: error.message,
      });
    }
  },

  // Create a new specialty (Admin only)
  createSpecialty: async (req, res) => {
    try {
      const { name, nameEn, category, description, sortOrder } = req.body;

      // Check if specialty already exists
      const existingSpecialty = await Specialty.findOne({ name });
      if (existingSpecialty) {
        return res.status(400).json({
          success: false,
          message: "Specialty already exists",
        });
      }

      const specialty = new Specialty({
        name,
        nameEn,
        category: category || "OTHER",
        description,
        sortOrder: sortOrder || 0,
      });

      const savedSpecialty = await specialty.save();

      res.status(201).json({
        success: true,
        message: "Specialty created successfully",
        data: savedSpecialty,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating specialty",
        error: error.message,
      });
    }
  },

  // Update a specialty (Admin only)
  updateSpecialty: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, nameEn, category, description, sortOrder, isActive } =
        req.body;

      const specialty = await Specialty.findByIdAndUpdate(
        id,
        {
          name,
          nameEn,
          category,
          description,
          sortOrder,
          isActive,
          updatedAt: Date.now(),
        },
        { new: true, runValidators: true }
      );

      if (!specialty) {
        return res.status(404).json({
          success: false,
          message: "Specialty not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Specialty updated successfully",
        data: specialty,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating specialty",
        error: error.message,
      });
    }
  },

  // Delete a specialty (Admin only)
  deleteSpecialty: async (req, res) => {
    try {
      const { id } = req.params;

      const specialty = await Specialty.findByIdAndDelete(id);

      if (!specialty) {
        return res.status(404).json({
          success: false,
          message: "Specialty not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Specialty deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting specialty",
        error: error.message,
      });
    }
  },
};

module.exports = specialtyController;
