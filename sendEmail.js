// import sgMail from "@sendgrid/mail";
// import dotenv from "dotenv";
// dotenv.config();
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// export const sendResetEmail = async (to, token) => {
//   const resetUrl = `${process.env.SENDER_URL}/reset-password/${token}`;
//   // console.log(resetUrl);
//   const msg = {
//     to: to,
//     from: `${process.env.SENDER_EMAIL}`,
//     subject: "Password Reset Request",
//     html: `
//       <p>You requested to reset your password.</p>
//       <p>Click the link below to reset it:</p>
//       <a href="${resetUrl}">${resetUrl}</a>
//       <p>This link will expire in 1 hour.</p>
//     `,
//   };
//   console.log(msg);
//   try {
//     await sgMail.send(msg);
//     console.log("Reset email sent to:", to);
//   } catch (error) {
//     console.error("SendGrid error:", error.response?.body || error.message);
//     throw new Error("Email could not be sent");
//   }
// };

// import nodemailer from "nodemailer";
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// await transporter.sendMail({
//   from: process.env.EMAIL_USER,
//   to: recipientEmail,
//   subject: "New Answer to Your Question",

//   html: `
//       <p>You requested to reset your password.</p>
//       <p>Click the link below to reset it:</p>
//       <a href="${resetUrl}">${resetUrl}</a>
//       <p>This link will expire in 1 hour.</p>
//     `,
// });

import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  service: "gmail", // or your SMTP service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send password reset email
 */
export const sendResetEmail = async (to, token) => {
  const resetUrl = `${process.env.SENDER_URL}/reset-password/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: "Password Reset Request",
    html: `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .email-container {
                background-color: #ffffff;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 25px;
            }
            .header h1 {
                color: #2c3e50;
                margin-bottom: 10px;
            }
            .content {
                margin-bottom: 25px;
            }
            .reset-button {
                display: inline-block;
                padding: 14px 28px;
                background: #526cf0; /* Bright blue for better visibility */
                color:white  !important;
                text-decoration: none;
                font-weight: bold;
                border-radius: 6px;
                margin: 25px 0;
                font-size: 16px;
                text-align: center;
                transition: all 0.3s ease;
                border: 2px solid #526cf0; /* Darker border for contrast */
            }
            .reset-button:hover {
                background: #526cf0; /* Slightly darker on hover */
            }
            .button-container {
                text-align: center;
                margin: 20px 0;
            }
            .expiry-note {
                color: #dc2626; /* Red for urgency */
                font-weight: bold;
                margin: 15px 0;
                font-size: 14px;
            }
            .footer {
                font-size: 12px;
                color: #666666;
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e5e5;
            }
            .support-link {
                color: #2563eb;
                text-decoration: none;
                font-weight: bold;
            }
            p {
                margin-bottom: 15px;
                font-size: 15px;
                color: #444444;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>Password Reset Request</h1>
            </div>
            
            <div class="content">
                <p>Hello,</p>
                
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                
                <div class="button-container">
                    <a href="${resetUrl}" class="reset-button">Reset My Password</a>
                </div>
                
                <p class="expiry-note">⚠️ This link will expire in 1 hour.</p>
                
                <p>If you didn't request this password reset, please ignore this email - your account remains secure.</p>
                
                <p>Need help? Contact our <a href="mailto:support@yourcompany.com" class="support-link">support team</a>.</p>
            </div>
            
            <div class="footer">
                <p>© ${new Date().getFullYear()} Your Company Name</p>
                <p>123 Business Street, City, Country</p>
            </div>
        </div>
    </body>
    </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Reset email sent to:", to);
  } catch (error) {
    console.error("Email error:", error);
    throw new Error("Email could not be sent");
  }
};
