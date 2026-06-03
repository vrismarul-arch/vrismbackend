import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { uploadResume } from "../utils/resumeUpload.js";
import {
  sendApplicationConfirmation,
  sendAdminNotification,
  sendStatusUpdateEmail,
} from "../services/emailService.js";

/* =========================
   CREATE APPLICATION
========================= */

export const createApplication = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      jobId,
      position,
      experience,
      location,
      linkedin,
      portfolio,
      coverLetter,
    } = req.body;

    // Check if application already exists for this job and email
    const existingApplication = await Application.findOne({
      email,
      jobId,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this position",
      });
    }

    let resumeUrl = "";

    if (req.file) {
      resumeUrl = await uploadResume(req.file);
    }

    const application = await Application.create({
      fullName,
      email,
      phone,
      jobId,
      position,
      experience,
      location,
      linkedin,
      portfolio,
      coverLetter,
      resumeUrl,
      status: "Pending",
    });

    // Send email confirmation to applicant (don't wait for response)
    sendApplicationConfirmation(application, jobId).catch((err) => {
      console.error("Failed to send confirmation email:", err);
    });

    // Send notification to admin (don't wait for response)
    sendAdminNotification(application, jobId).catch((err) => {
      console.error("Failed to send admin notification:", err);
    });

    res.status(201).json({
      success: true,
      application,
      message: "Application submitted successfully! Confirmation email sent.",
    });
  } catch (error) {
    console.error("Create application error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   GET ALL APPLICATIONS
========================= */

export const getApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("jobId", "title company category")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   GET APPLICATIONS BY JOB
========================= */

export const getApplicationsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const applications = await Application.find({ jobId })
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Get applications by job error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   GET SINGLE APPLICATION
========================= */

export const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate(
      "jobId",
      "title company category description"
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Get application by id error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   UPDATE APPLICATION STATUS
========================= */

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, comments } = req.body;

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("jobId", "title company");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Send status update email to applicant
    if (status && status !== application.status) {
      sendStatusUpdateEmail(req.params.id, status, comments).catch((err) => {
        console.error("Failed to send status update email:", err);
      });
    }

    res.status(200).json({
      success: true,
      application,
      message: `Status updated to ${status}`,
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   BULK UPDATE STATUS
========================= */

export const bulkUpdateStatus = async (req, res) => {
  try {
    const { applicationIds, status, comments } = req.body;

    if (!applicationIds || !applicationIds.length) {
      return res.status(400).json({
        success: false,
        message: "No application IDs provided",
      });
    }

    const result = await Application.updateMany(
      { _id: { $in: applicationIds } },
      { status },
      { new: true }
    );

    // Send status update emails to all applicants
    for (const id of applicationIds) {
      sendStatusUpdateEmail(id, status, comments).catch((err) => {
        console.error(`Failed to send email for application ${id}:`, err);
      });
    }

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} applications updated successfully`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Bulk update error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   DELETE APPLICATION
========================= */

export const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Delete application error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   GET APPLICATION STATISTICS
========================= */

export const getApplicationStats = async (req, res) => {
  try {
    const stats = await Application.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalApplications = await Application.countDocuments();

    res.status(200).json({
      success: true,
      stats,
      totalApplications,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   RESEND CONFIRMATION EMAIL
========================= */

export const resendConfirmationEmail = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    await sendApplicationConfirmation(application, application.jobId);

    res.status(200).json({
      success: true,
      message: "Confirmation email resent successfully",
    });
  } catch (error) {
    console.error("Resend email error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   DOWNLOAD APPLICATIONS AS CSV
========================= */

export const exportApplicationsCSV = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("jobId", "title")
      .sort({ createdAt: -1 });

    // Prepare CSV data
    const csvData = applications.map((app) => ({
      "Full Name": app.fullName,
      Email: app.email,
      Phone: app.phone,
      Position: app.position,
      "Job Title": app.jobId?.title || "N/A",
      Experience: app.experience,
      Location: app.location,
      LinkedIn: app.linkedin,
      Portfolio: app.portfolio,
      Status: app.status,
      "Applied Date": new Date(app.createdAt).toLocaleString(),
    }));

    res.status(200).json({
      success: true,
      data: csvData,
    });
  } catch (error) {
    console.error("Export CSV error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};