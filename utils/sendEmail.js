const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, body) => {
    try{
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"Form Builder App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            text: body
        });
    }catch(err){
        console.error("Email sending failed:", err);
    }
};

module.exports = sendEmail;