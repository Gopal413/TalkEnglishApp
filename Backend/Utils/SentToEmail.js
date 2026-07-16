require('dotenv').config(); // Load environment variables
const nodemailer = require('nodemailer');

// 1. Initialize the transporter (The connection config)
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use 'gmail' as a shortcut for Gmail
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASS);

/**
 * Reusable function to send OTP emails
 * @param {string} toEmail - The recipient's email address
 * @param {string|number} otp - The generated OTP code
 */
const sendOTPEmail = async (toEmail, otp) => {
    try {
        console.log("sendOTPEmail start 1");
        // 2. Define mail options dynamically
        const mailOptions = {
            from: `"Your App Security" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Your Verification Code (OTP)',
            // Plain text backup
            text: `Your OTP is ${otp}. It is valid for 5 minutes. Please do not share it with anyone.`,
            // Beautiful HTML template
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">Verify Your Account</h2>
                    <p style="font-size: 16px; color: #555;">Hello,</p>
                    <p style="font-size: 16px; color: #555;">Use the verification code below to complete your request. This code is valid for 5 minutes:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50; background-color: #f9f9f9; padding: 10px 20px; border-radius: 5px; border: 1px dashed #4CAF50;">
                            ${otp}
                        </span>
                    </div>
                    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
                        If you didn't request this code, you can safely ignore this email.
                    </p>
                </div>
            `
        };
                console.log("sendOTPEmail start 2");

        // 3. Send the email and return the result
        const info = await transporter.sendMail(mailOptions);
                console.log("sendOTPEmail start 3");

        console.log("result :",info)
        console.timeEnd("email send time")
        console.log(`OTP sent successfully to ${toEmail}. MessageID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('Error sending OTP email:', error);
        return { success: false, error: error.message };
    }
};

// Export the function so other files can use it
module.exports = { sendOTPEmail };