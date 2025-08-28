const ProblemReport = require("../models/ProblemReport");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Create a new problem report
exports.createProblemReport = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      screenshotUrl,
      browserInfo,
    } = req.body;

    const problemReport = new ProblemReport({
      title,
      description,
      category,
      priority: priority || "medium",
      reportedBy: req.user.id,
      screenshotUrl,
      browserInfo,
    });

    await problemReport.save();

    // Populate user info
    await problemReport.populate("reportedBy", "name email");

    // Create notification for admins
    const admins = await User.find({ role: "ADMIN" });
    const notifications = admins.map((admin) => ({
      userId: admin._id,
      type: "PROBLEM_REPORT",
      title: "New Problem Report",
      content: `New problem report submitted: ${title}`,
      metadata: {
        reportId: problemReport._id,
        reportedBy: req.user.name,
        category: category,
      },
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: "Problem report submitted successfully",
      data: problemReport,
    });
  } catch (error) {
    console.error("Error creating problem report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create problem report",
      error: error.message,
    });
  }
};

// Get all problem reports (admin only)
exports.getAllProblemReports = async (req, res) => {
  try {
    console.log("🎯 getAllProblemReports controller called");
    console.log("📋 Query params:", req.query);
    console.log("👤 User role:", req.user?.role);

    const {
      page = 1,
      limit = 10,
      status,
      category,
      priority,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (page - 1) * limit;

    const problemReports = await ProblemReport.find(filter)
      .populate("reportedBy", "name email role")
      .populate("assignedTo", "name email")
      .populate("comments.author", "name email role")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ProblemReport.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        problemReports,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReports: total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching problem reports:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch problem reports",
      error: error.message,
    });
  }
};

// Get user's problem reports
exports.getUserProblemReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = { reportedBy: req.user.id };
    if (status) filter.status = status;

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (page - 1) * limit;

    const problemReports = await ProblemReport.find(filter)
      .populate("assignedTo", "name email")
      .populate("comments.author", "name email role")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ProblemReport.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        problemReports,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReports: total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user problem reports:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch problem reports",
      error: error.message,
    });
  }
};

// Get single problem report
exports.getProblemReport = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 getProblemReport - Requested ID:", id);
    console.log("👤 getProblemReport - User:", {
      id: req.user.id,
      role: req.user.role,
      email: req.user.email,
    });

    const problemReport = await ProblemReport.findById(id)
      .populate("reportedBy", "name email role")
      .populate("assignedTo", "name email")
      .populate("comments.author", "name email role");

    if (!problemReport) {
      console.log("❌ getProblemReport - Report not found");
      return res.status(404).json({
        success: false,
        message: "Problem report not found",
      });
    }

    console.log("📋 getProblemReport - Report found:", {
      reportId: problemReport._id,
      reportedById: problemReport.reportedBy._id.toString(),
      reportedByEmail: problemReport.reportedBy.email,
    });

    // Check if user can access this report
    const userIdString = req.user.id.toString();
    const reportOwnerIdString = problemReport.reportedBy._id.toString();

    console.log("🔍 getProblemReport - ID Comparison:", {
      userIdString,
      reportOwnerIdString,
      userIdType: typeof req.user.id,
      reportOwnerIdType: typeof problemReport.reportedBy._id,
      areEqual: userIdString === reportOwnerIdString,
      userRole: req.user.role,
    });

    if (req.user.role !== "ADMIN" && userIdString !== reportOwnerIdString) {
      console.log("🚫 getProblemReport - Access denied:", {
        userRole: req.user.role,
        userIdString,
        reportOwnerIdString,
        areEqual: userIdString === reportOwnerIdString,
      });
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      data: problemReport,
    });
  } catch (error) {
    console.error("Error fetching problem report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch problem report",
      error: error.message,
    });
  }
};

// Update problem report (admin only)
exports.updateProblemReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo, adminNotes, resolution } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (resolution !== undefined) updateData.resolution = resolution;

    const problemReport = await ProblemReport.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email");

    if (!problemReport) {
      return res.status(404).json({
        success: false,
        message: "Problem report not found",
      });
    }

    // Send notification to user if status changed
    if (status && ["resolved", "closed"].includes(status)) {
      await Notification.create({
        userId: problemReport.reportedBy._id,
        type: "PROBLEM_REPORT",
        title: "Problem Report Updated",
        content: `Your problem report "${problemReport.title}" has been ${status}`,
        metadata: {
          reportId: problemReport._id,
          status: status,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Problem report updated successfully",
      data: problemReport,
    });
  } catch (error) {
    console.error("Error updating problem report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update problem report",
      error: error.message,
    });
  }
};

// Add comment to problem report
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment message is required",
      });
    }

    const problemReport = await ProblemReport.findById(id);

    if (!problemReport) {
      return res.status(404).json({
        success: false,
        message: "Problem report not found",
      });
    }

    // Check if user can comment on this report
    if (
      req.user.role !== "ADMIN" &&
      problemReport.reportedBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const newComment = {
      author: req.user.id,
      message: message.trim(),
      isAdminReply: req.user.role === "ADMIN",
    };

    problemReport.comments.push(newComment);
    await problemReport.save();

    await problemReport.populate("comments.author", "name email role");

    // Send notification to the other party
    const recipientId =
      req.user.role === "ADMIN"
        ? problemReport.reportedBy
        : await User.find({ role: "ADMIN" }).select("_id");

    if (req.user.role === "ADMIN") {
      // Admin replied, notify user
      await Notification.create({
        userId: problemReport.reportedBy,
        type: "PROBLEM_REPORT",
        title: "New Reply to Your Problem Report",
        content: `Admin replied to your problem report: "${problemReport.title}"`,
        metadata: {
          reportId: problemReport._id,
          commentId: newComment._id,
        },
      });
    } else {
      // User commented, notify admins
      const adminNotifications = (await User.find({ role: "ADMIN" })).map(
        (admin) => ({
          userId: admin._id,
          type: "PROBLEM_REPORT",
          title: "New Comment on Problem Report",
          content: `User commented on problem report: "${problemReport.title}"`,
          metadata: {
            reportId: problemReport._id,
            commentId: newComment._id,
            commentBy: req.user.name,
          },
        })
      );

      if (adminNotifications.length > 0) {
        await Notification.insertMany(adminNotifications);
      }
    }

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      data: problemReport.comments[problemReport.comments.length - 1],
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: error.message,
    });
  }
};

// Get problem report statistics (admin only)
exports.getProblemReportStats = async (req, res) => {
  try {
    const stats = await Promise.all([
      ProblemReport.countDocuments({ status: "open" }),
      ProblemReport.countDocuments({ status: "in_progress" }),
      ProblemReport.countDocuments({ status: "resolved" }),
      ProblemReport.countDocuments({ status: "closed" }),
      ProblemReport.countDocuments({ priority: "critical" }),
      ProblemReport.countDocuments({ priority: "high" }),
      ProblemReport.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
      ]),
      ProblemReport.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const [
      openCount,
      inProgressCount,
      resolvedCount,
      closedCount,
      criticalCount,
      highCount,
      categoriesStats,
      dailyStats,
    ] = stats;

    res.status(200).json({
      success: true,
      data: {
        statusStats: {
          open: openCount,
          in_progress: inProgressCount,
          resolved: resolvedCount,
          closed: closedCount,
        },
        priorityStats: {
          critical: criticalCount,
          high: highCount,
        },
        categoryStats: categoriesStats,
        dailyStats: dailyStats,
        totalReports: openCount + inProgressCount + resolvedCount + closedCount,
      },
    });
  } catch (error) {
    console.error("Error fetching problem report stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
};

// Delete problem report (admin only)
exports.deleteProblemReport = async (req, res) => {
  try {
    const { id } = req.params;

    const problemReport = await ProblemReport.findByIdAndDelete(id);

    if (!problemReport) {
      return res.status(404).json({
        success: false,
        message: "Problem report not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Problem report deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting problem report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete problem report",
      error: error.message,
    });
  }
};
