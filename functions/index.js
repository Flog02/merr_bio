/* eslint-disable max-len */
// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Configure nodemailer with your email service
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "flogertymeraj3@gmail.com",
    pass: "jjxb wzzm pnnu mwla",
  },
});

// Firestore trigger for new verification codes
exports.sendVerificationCode = functions.firestore
    .document("pendingRegistrations/{docId}")
    .onCreate(async (snap, context) => {
      const data = snap.data();
      const email = data.email;
      const code = data.verificationCode;

      const mailOptions = {
        from: "flogertymeraj3@gmail.com",
        to: email,
        subject: "Your Verification Code",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #4a5568; text-align: center;">Verification Code</h2>
          <div style="background-color: #f7fafc; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center;">
            <h1 style="font-size: 32px; letter-spacing: 5px; color: #2d3748;">${code}</h1>
          </div>
          <p style="color: #4a5568; line-height: 1.5;">Please use this code to complete your registration. The code will expire in 1 hour.</p>
          <p style="color: #718096; font-size: 14px; margin-top: 30px;">If you did not request this code, please ignore this email.</p>
        </div>
      `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
        return {success: true};
      } catch (error) {
        console.error("Error sending email:", error);
        return {error: error.toString()};
      }
    });

// Also handle password reset codes
exports.sendPasswordResetCode = functions.firestore
    .document("passwordResetRequests/{docId}")
    .onCreate(async (snap, context) => {
      const data = snap.data();
      const email = data.email;
      const code = data.verificationCode;

      const mailOptions = {
        from: "flogertymeraj3@gmail.com",
        to: email,
        subject: "Your Password Reset Code",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #4a5568; text-align: center;">Password Reset Code</h2>
          <div style="background-color: #f7fafc; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center;">
            <h1 style="font-size: 32px; letter-spacing: 5px; color: #2d3748;">${code}</h1>
          </div>
          <p style="color: #4a5568; line-height: 1.5;">Please use this code to reset your password. The code will expire in 1 hour.</p>
          <p style="color: #718096; font-size: 14px; margin-top: 30px;">If you did not request this code, please ignore this email.</p>
        </div>
      `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${email}`);
        return {success: true};
      } catch (error) {
        console.error("Error sending email:", error);
        return {error: error.toString()};
      }
    });
