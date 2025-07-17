const nodemailer = require("nodemailer");

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send email verification
const sendVerificationEmail = async (email, token, userName) => {
  try {
    const transporter = createTransporter();

    const verificationUrl = `${process.env.CLIENT_URL}/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Verify Your Email - TuniMed",
      html: `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #2c3e50;">Welcome to TuniMed!</h1>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <h2 style="color: #34495e;">Hello ${userName},</h2>
                        <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6;">
                            Thank you for registering with TuniMed! To complete your registration, 
                            please verify your email address by clicking the button below.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" 
                           style="background-color: #3498db; color: white; padding: 15px 30px; 
                                  text-decoration: none; border-radius: 5px; font-weight: bold; 
                                  display: inline-block;">
                            Verify Email Address
                        </a>
                    </div>
                    
                    <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="color: #856404; margin: 0; font-size: 14px;">
                            <strong>Note:</strong> This verification link will expire in 24 hours.
                        </p>
                    </div>
                    
                    <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px;">
                        <p style="color: #6c757d; font-size: 12px; text-align: center;">
                            If you didn't create an account with TuniMed, please ignore this email.
                        </p>
                        <p style="color: #6c757d; font-size: 12px; text-align: center;">
                            © 2025 TuniMed. All rights reserved.
                        </p>
                    </div>
                </div>
            `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, token, userName) => {
  try {
    const transporter = createTransporter();

    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${token}`;

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Reset Your Password - TuniMed",
      html: `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #2c3e50;">Password Reset Request</h1>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <h2 style="color: #34495e;">Hello ${userName},</h2>
                        <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6;">
                            We received a request to reset your password for your TuniMed account. 
                            Click the button below to reset your password.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #e74c3c; color: white; padding: 15px 30px; 
                                  text-decoration: none; border-radius: 5px; font-weight: bold; 
                                  display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    
                    <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="color: #721c24; margin: 0; font-size: 14px;">
                            <strong>Security Note:</strong> This reset link will expire in 1 hour for your security.
                        </p>
                    </div>
                    
                    <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px;">
                        <p style="color: #6c757d; font-size: 12px; text-align: center;">
                            If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
                        </p>
                        <p style="color: #6c757d; font-size: 12px; text-align: center;">
                            © 2025 TuniMed. All rights reserved.
                        </p>
                    </div>
                </div>
            `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, userName, userRole) => {
  try {
    const transporter = createTransporter();

    const roleMessage =
      userRole === "DOCTOR"
        ? "As a doctor, you can now manage your appointments and patients."
        : "As a patient, you can now book appointments and manage your health records.";

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Welcome to TuniMed!",
      html: `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #2c3e50;">Welcome to TuniMed!</h1>
                    </div>
                    
                    <div style="background-color: #d4edda; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <h2 style="color: #155724;">Hello ${userName},</h2>
                        <p style="color: #155724; font-size: 16px; line-height: 1.6;">
                            Your email has been successfully verified! Welcome to TuniMed, 
                            your trusted healthcare platform.
                        </p>
                        <p style="color: #155724; font-size: 16px; line-height: 1.6;">
                            ${roleMessage}
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.CLIENT_URL}/dashboard" 
                           style="background-color: #28a745; color: white; padding: 15px 30px; 
                                  text-decoration: none; border-radius: 5px; font-weight: bold; 
                                  display: inline-block;">
                            Get Started
                        </a>
                    </div>
                    
                    <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px;">
                        <p style="color: #6c757d; font-size: 12px; text-align: center;">
                            © 2025 TuniMed. All rights reserved.
                        </p>
                    </div>
                </div>
            `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
};

// Send doctor approval email
const sendDoctorApprovalEmail = async (email, doctorName, notes) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "🎉 Your Doctor Application Has Been Approved - TuniMed",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #27ae60;">✅ Application Approved!</h1>
          </div>
          
          <div style="background-color: #d4edda; padding: 25px; border-radius: 15px; margin-bottom: 25px; border-left: 5px solid #28a745;">
            <h2 style="color: #155724; margin-top: 0;">Congratulations Dr. ${doctorName}!</h2>
            <p style="color: #155724; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
              🎉 Great news! Your doctor verification application has been <strong>approved</strong> by our admin team.
            </p>
            <p style="color: #155724; font-size: 16px; line-height: 1.6;">
              You can now access all doctor features on the TuniMed platform, including:
            </p>
            <ul style="color: #155724; font-size: 15px; line-height: 1.6;">
              <li>✅ Manage your professional profile</li>
              <li>✅ Set your availability and consultation hours</li>
              <li>✅ Receive and manage patient appointments</li>
              <li>✅ Access patient medical records (with permission)</li>
              <li>✅ Communicate with patients through our platform</li>
            </ul>
          </div>

          ${
            notes
              ? `
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 5px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">💬 Admin Notes:</h3>
            <p style="color: #856404; font-size: 15px; line-height: 1.6; margin: 0;">
              "${notes}"
            </p>
          </div>
          `
              : ""
          }
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/dashboard" 
               style="background-color: #28a745; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold; 
                      display: inline-block; font-size: 16px;">
              🚀 Access Your Doctor Dashboard
            </a>
          </div>

          <div style="background-color: #e7f3ff; padding: 20px; border-radius: 10px; margin: 25px 0;">
            <h3 style="color: #0056b3; margin-top: 0;">📋 Next Steps:</h3>
            <ol style="color: #0056b3; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li>Complete your professional profile with photo and detailed information</li>
              <li>Set up your consultation schedule and availability</li>
              <li>Configure your appointment preferences and fees</li>
              <li>Start receiving patient appointments!</li>
            </ol>
          </div>
          
          <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px;">
            <p style="color: #6c757d; font-size: 13px; text-align: center; margin: 0;">
              Welcome to the TuniMed medical community! 🩺
            </p>
            <p style="color: #6c757d; font-size: 12px; text-align: center; margin: 5px 0 0 0;">
              © 2025 TuniMed. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Doctor approval email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending doctor approval email:", error);
    throw new Error("Failed to send doctor approval email");
  }
};

// Send doctor rejection email
const sendDoctorRejectionEmail = async (email, doctorName, notes) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Update on Your Doctor Application - TuniMed",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e74c3c;">Application Update</h1>
          </div>
          
          <div style="background-color: #f8d7da; padding: 25px; border-radius: 15px; margin-bottom: 25px; border-left: 5px solid #dc3545;">
            <h2 style="color: #721c24; margin-top: 0;">Dear Dr. ${doctorName},</h2>
            <p style="color: #721c24; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
              Thank you for your interest in joining the TuniMed platform. After careful review, 
              we regret to inform you that your doctor verification application cannot be approved at this time.
            </p>
          </div>

          ${
            notes
              ? `
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 5px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">📋 Reason for Rejection:</h3>
            <p style="color: #856404; font-size: 15px; line-height: 1.6; margin: 0;">
              "${notes}"
            </p>
          </div>
          `
              : ""
          }

          <div style="background-color: #d1ecf1; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 5px solid #17a2b8;">
            <h3 style="color: #0c5460; margin-top: 0;">🔄 What You Can Do:</h3>
            <ul style="color: #0c5460; font-size: 15px; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li>Review the reason for rejection above</li>
              <li>Address any missing or incorrect information</li>
              <li>Ensure all required documents are properly uploaded</li>
              <li>Submit a new application once issues are resolved</li>
            </ul>
          </div>

          <div style="background-color: #e2e3e5; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
            <h3 style="color: #383d41; margin-top: 0;">📞 Need Help?</h3>
            <p style="color: #383d41; font-size: 15px; line-height: 1.6; margin: 0;">
              If you have questions about this decision or need assistance with your application, 
              please don't hesitate to contact our support team.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/auth/signup" 
               style="background-color: #17a2b8; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold; 
                      display: inline-block; font-size: 16px; margin-right: 15px;">
              📝 Submit New Application
            </a>
            <a href="${process.env.CLIENT_URL}/contact" 
               style="background-color: #6c757d; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold; 
                      display: inline-block; font-size: 16px;">
              📞 Contact Support
            </a>
          </div>
          
          <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px;">
            <p style="color: #6c757d; font-size: 13px; text-align: center; margin: 0;">
              We appreciate your interest in TuniMed and hope to work with you in the future.
            </p>
            <p style="color: #6c757d; font-size: 12px; text-align: center; margin: 5px 0 0 0;">
              © 2025 TuniMed. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Doctor rejection email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending doctor rejection email:", error);
    throw new Error("Failed to send doctor rejection email");
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("Email configuration is valid");
    return true;
  } catch (error) {
    console.error("Email configuration error:", error);
    throw new Error("Invalid email configuration");
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  testEmailConfig,
  sendDoctorApprovalEmail,
  sendDoctorRejectionEmail,
};
