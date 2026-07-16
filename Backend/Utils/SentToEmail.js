require('dotenv').config(); // Load environment variables
//const nodemailer = require('nodemailer');
//const { Resend } = require("resend");

const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// 1. Initialize the transporter (The connection config)
// const transporter = nodemailer.createTransport({
//     service: 'gmail', // You can use 'gmail' as a shortcut for Gmail
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     }
// });
//const resend = new Resend(process.env.RESEND_API_KEY);
// console.log(process.env.EMAIL_USER);
// console.log(process.env.EMAIL_PASS);

/**
 * Reusable function to send OTP emails
 * @param {string} toEmail - The recipient's email address
 * @param {string|number} otp - The generated OTP code
 */
// const sendOTPEmail = async (toEmail, otp) => {
//     try {
     
//         console.log("sendOTPEmail start 1");
//         // 2. Define mail options dynamically
//         const mailOptions = {
//             from: `"Your App Security" <${process.env.EMAIL_USER}>`,
//             to: toEmail,
//             subject: 'Your Verification Code (OTP)',
//             // Plain text backup
//             text: `Your OTP is ${otp}. It is valid for 5 minutes. Please do not share it with anyone.`,
//             // Beautiful HTML template
//             html: `
//                 <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
//                     <h2 style="color: #333; text-align: center;">Verify Your Account</h2>
//                     <p style="font-size: 16px; color: #555;">Hello,</p>
//                     <p style="font-size: 16px; color: #555;">Use the verification code below to complete your request. This code is valid for 5 minutes:</p>
//                     <div style="text-align: center; margin: 30px 0;">
//                         <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50; background-color: #f9f9f9; padding: 10px 20px; border-radius: 5px; border: 1px dashed #4CAF50;">
//                             ${otp}
//                         </span>
//                     </div>
//                     <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
//                         If you didn't request this code, you can safely ignore this email.
//                     </p>
//                 </div>
//             `
//         };
//           console.log("sendOTPEmail start 2");

//         // 3. Send the email and return the result
//         const info = await transporter.sendMail(mailOptions);
//                 console.log("sendOTPEmail start 3");

//         console.log("result :",info)
//         console.timeEnd("email send time")
//         console.log(`OTP sent successfully to ${toEmail}. MessageID: ${info.messageId}`);
//         return { success: true, messageId: info.messageId };

//     } catch (error) {
//         console.error('Error sending OTP email:', error);
//         return { success: false, error: error.message };
//     }
// };

// const sendOTPEmail = async (toEmail, otp) => {
//     try {
//         const response = await resend.emails.send({
//             from: process.env.EMAIL_FROM,
//             to: toEmail,
//             subject: "Your Verification Code (OTP)",
//             html: `
//                 <div style="font-family: Arial, sans-serif;">
//                     <h2>Verify Your Account</h2>
//                     <p>Your OTP is:</p>

//                     <h1>${otp}</h1>

//                     <p>This OTP is valid for 5 minutes.</p>
//                 </div>
//             `
//         });

//         console.log("Email sent:", response);

//         return {
//             success: true,
//             data: response
//         };

//     } catch (error) {
//         console.error("Resend Error:", error);

//         return {
//             success: false,
//             error: error.message
//         };
//     }
// };

//sendgrid
const sendOTPEmail = async (toEmail, otp) => {
    try {
        const message = {
            to: toEmail,
            from: process.env.EMAIL_USER, // Verified Sender Email
            subject: "TalkEnglish - Email Verification OTP",
            text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
            html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #ddd;border-radius:8px;">
                    <h2 style="text-align:center;color:#1976d2;">
                        TalkEnglish
                    </h2>

                    <p>Hello,</p>

                    <p>Your verification code is:</p>

                    <div style="text-align:center;margin:25px 0;">
                        <span style="font-size:32px;font-weight:bold;letter-spacing:5px;color:#1976d2;">
                            ${otp}
                        </span>
                    </div>

                    <p>This OTP is valid for <b>5 minutes</b>.</p>

                    <p>If you did not request this OTP, you can ignore this email.</p>

                    <hr>

                    <p style="font-size:12px;color:gray;">
                        © TalkEnglish
                    </p>
                </div>
            `
        };

        const response = await sgMail.send(message);

        console.log("Email Sent Successfully");
        console.log(response);

        return {
            success: true
        };

    } catch (error) {

        console.error("SendGrid Error:");

        console.error(error.response?.body || error);

        return {
            success: false,
            error: error.message
        };
    }
};


// Export the function so other files can use it
module.exports = { sendOTPEmail };