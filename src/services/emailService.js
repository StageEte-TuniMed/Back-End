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
};
