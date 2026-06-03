import transporter from "../config/emailConfig.js";
import {
  getApplicantEmailTemplate,
  getAdminEmailTemplate,
  getStatusUpdateEmailTemplate,
} from "../utils/emailTemplates.js";
import Application from "../models/Application.js";
import Job from "../models/Job.js";

// Send application confirmation email to applicant
export const sendApplicationConfirmation = async (application, jobId) => {
  try {
    // Ensure application is a plain object
    const appObj = application.toObject ? application.toObject() : application;
    
    // Get job details
    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || "Hiring Team"}" <${process.env.EMAIL_USER}>`,
      to: application.email,
      subject: `Application Received: ${job.title} position`,
      html: getApplicantEmailTemplate(appObj, job.title),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Application confirmation email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending application confirmation:", error);
    return false;
  }
};

// Send notification to admin(s)
export const sendAdminNotification = async (application, jobId) => {
  try {
    const appObj = application.toObject ? application.toObject() : application;
    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    // Get admin emails from environment or database
    const adminEmails = process.env.ADMIN_EMAILS ? 
      process.env.ADMIN_EMAILS.split(',') : 
      [process.env.EMAIL_USER];

    for (const adminEmail of adminEmails) {
      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || "Hiring Team"}" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `New Application: ${application.fullName} for ${job.title}`,
        html: getAdminEmailTemplate(appObj, job.title),
      };

      await transporter.sendMail(mailOptions);
    }
    
    console.log("Admin notification sent");
    return true;
  } catch (error) {
    console.error("Error sending admin notification:", error);
    return false;
  }
};

// Send status update email to applicant
export const sendStatusUpdateEmail = async (applicationId, status, comments = '') => {
  try {
    const application = await Application.findById(applicationId).populate('jobId');
    if (!application) {
      throw new Error('Application not found');
    }
    
    const appObj = application.toObject ? application.toObject() : application;

    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || "Hiring Team"}" <${process.env.EMAIL_USER}>`,
      to: application.email,
      subject: `Application Status Update: ${application.jobId.title}`,
      html: getStatusUpdateEmailTemplate(appObj, application.jobId.title, status, comments),
    };

    await transporter.sendMail(mailOptions);
    console.log('Status update email sent');
    return true;
  } catch (error) {
    console.error('Error sending status update email:', error);
    return false;
  }
};