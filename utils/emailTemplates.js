// Application confirmation email to applicant
export const getApplicantEmailTemplate = (application, jobTitle) => {
  // Convert ObjectId to string safely
  const applicationId = application._id?.toString() || application._id || 'N/A';
  const shortId = applicationId.slice(-8);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Received</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f7fa;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 0;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 30px;
        }
        .status-badge {
          display: inline-block;
          background: #ff9800;
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .info-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .info-item {
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e0e0e0;
        }
        .info-label {
          font-weight: bold;
          color: #555;
          width: 120px;
          display: inline-block;
        }
        .info-value {
          color: #333;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
          font-weight: bold;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .social-links {
          margin-top: 15px;
        }
        .social-links a {
          color: #667eea;
          text-decoration: none;
          margin: 0 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Application Received!</h1>
          <p>Thank you for applying</p>
        </div>
        
        <div class="content">
          <div class="status-badge">Status: ${application.status || 'Pending Review'}</div>
          
          <h2>Hello ${application.fullName},</h2>
          
          <p>We have successfully received your application for the <strong>${jobTitle}</strong> position. Our hiring team will review your application and get back to you soon.</p>
          
          <div class="info-section">
            <h3>📋 Application Summary</h3>
            <div class="info-item">
              <span class="info-label">Application ID:</span>
              <span class="info-value">${shortId}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Position:</span>
              <span class="info-value">${jobTitle}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Applied Date:</span>
              <span class="info-value">${new Date(application.createdAt).toLocaleString()}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">${application.email}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Phone:</span>
              <span class="info-value">${application.phone}</span>
            </div>
          </div>
          
          <p><strong>What's Next?</strong></p>
          <ul>
            <li>📧 Our team will review your application within 3-5 business days</li>
            <li>📞 You may be contacted for an initial screening call</li>
            <li>📝 Shortlisted candidates will be invited for interviews</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/applications/status/${application._id}" class="button">
              Track Application Status
            </a>
          </div>
          
          <p style="margin-top: 25px;">Best regards,<br>
          <strong>Hiring Team</strong><br>
          ${process.env.COMPANY_NAME || 'Company Name'}</p>
        </div>
        
        <div class="footer">
          <p>This is an automated confirmation. Please do not reply to this email.</p>
          <div class="social-links">
            <a href="#">LinkedIn</a> | 
            <a href="#">Twitter</a> | 
            <a href="#">Website</a>
          </div>
          <p>&copy; ${new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Admin notification email template
export const getAdminEmailTemplate = (application, jobTitle) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>New Application Received</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f7fa;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 700px;
          margin: 0 auto;
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          padding: 30px;
        }
        .alert-badge {
          background: #f44336;
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          display: inline-block;
          font-size: 12px;
          font-weight: bold;
        }
        .applicant-card {
          background: #f8f9fa;
          border-left: 4px solid #667eea;
          padding: 15px;
          margin: 15px 0;
          border-radius: 5px;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📝 New Job Application Received!</h2>
        </div>
        
        <div class="content">
          <div class="alert-badge">Action Required</div>
          
          <h3>A new application has been submitted for <strong>${jobTitle}</strong></h3>
          
          <div class="applicant-card">
            <h3>👤 Applicant Details</h3>
            <p><strong>Name:</strong> ${application.fullName}</p>
            <p><strong>Email:</strong> ${application.email}</p>
            <p><strong>Phone:</strong> ${application.phone}</p>
            <p><strong>Experience:</strong> ${application.experience || 'Not specified'}</p>
            <p><strong>Location:</strong> ${application.location || 'Not specified'}</p>
          </div>
          
          <div class="applicant-card">
            <h3>🔗 Links</h3>
            ${application.linkedin ? `<p><strong>LinkedIn:</strong> <a href="${application.linkedin}">View Profile</a></p>` : ''}
            ${application.portfolio ? `<p><strong>Portfolio:</strong> <a href="${application.portfolio}">View Portfolio</a></p>` : ''}
            ${application.resumeUrl ? `<p><strong>Resume:</strong> <a href="${application.resumeUrl}">Download Resume</a></p>` : ''}
          </div>
          
          ${application.coverLetter ? `
          <div class="applicant-card">
            <h3>📝 Cover Letter</h3>
            <p>${application.coverLetter.substring(0, 500)}${application.coverLetter.length > 500 ? '...' : ''}</p>
          </div>
          ` : ''}
          
          <a href="${process.env.ADMIN_URL || 'http://localhost:3000/admin'}/applications/${application._id}" class="button">
            Review Application →
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Status update email template
export const getStatusUpdateEmailTemplate = (application, jobTitle, status, comments = '') => {
  const statusColors = {
    'Reviewed': '#2196f3',
    'Accepted': '#4caf50',
    'Rejected': '#f44336'
  };
  
  const statusMessages = {
    'Reviewed': 'Your application has been reviewed by our team.',
    'Accepted': 'Congratulations! You have been shortlisted for the next round.',
    'Rejected': 'We regret to inform you that you have not been selected for this position.'
  };
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Application Status Update</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f7fa;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 10px;
          overflow: hidden;
        }
        .header {
          background: ${statusColors[status] || '#ff9800'};
          color: white;
          padding: 30px;
          text-align: center;
        }
        .content {
          padding: 30px;
        }
        .next-steps {
          background: #e3f2fd;
          padding: 15px;
          border-radius: 5px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Application Status Update</h2>
        </div>
        
        <div class="content">
          <p>Dear ${application.fullName},</p>
          
          <p>${statusMessages[status] || `Your application status has been updated to ${status}.`}</p>
          
          ${comments ? `<p><strong>Comments from HR:</strong> "${comments}"</p>` : ''}
          
          ${status === 'Accepted' ? `
          <div class="next-steps">
            <h3>📅 Next Steps:</h3>
            <ul>
              <li>Our HR team will contact you within 2-3 business days</li>
              <li>Please prepare for the interview process</li>
              <li>Have your documents ready for verification</li>
            </ul>
          </div>
          ` : ''}
          
          <p>Thank you for your interest in joining our team!</p>
          
          <p>Best regards,<br>Hiring Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};