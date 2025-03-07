/**
 * Business Partners Email Service
 * 
 * This service is responsible for sending password reset and account verification emails to users.
 * 
 * - Operates as a RESTful API using Express.js.
 * - Connects to an SMTP server to send emails.
 * - Exchanges data in JSON format.
 */

require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const winston = require('winston');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// 📌 Winston Logger Configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/app.log' })
    ]
});

// 📌 SMTP Configuration (Now only uses environment variables)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // Ensures boolean conversion
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// 📌 Test SMTP Connection
transporter.verify((error, success) => {
    if (error) {
        logger.error(`SMTP connection error: ${error.message}`);
    } else {
        logger.info("SMTP server successfully connected.");
    }
});

// 📌 Password Reset Email Endpoint
app.post('/send-reset-email', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        logger.warn("No email address provided.");
        return res.status(400).json({ error: "Email address is required." });
    }

    // 📌 Generate a random password reset token
    const resetToken = Math.random().toString(36).substr(2, 10);
    const resetLink = `https://pudo.com.tr/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: `"Pudo Business Partners Support" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Password Reset Request",
        html: `<p>Hello,</p>
               <p>To reset your password, please click the link below:</p>
               <a href="${resetLink}">${resetLink}</a>
               <p>This link is valid for 15 minutes.</p>
               <p>Pudo Support Team</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info(`Password reset email sent to: ${email}`);
        res.json({ message: "Password reset email sent successfully." });
    } catch (error) {
        logger.error(`Email sending error: ${error.message}`);
        res.status(500).json({ error: "Failed to send email!", details: error.message });
    }
});

// 📌 Start Server
app.listen(PORT, () => {
    logger.info(`Pudo Email Service is running:${PORT}`);
});

/**
 * 
 * 
 * business_user1234@pudo.com.tr
 * BusinessPudo1!!
 * 
 * Hardcoded API Keys
 * PRIVATE_API_KEY = "private-987654321-SECURE-KEY"
 * ADMIN_ACCESS_TOKEN = "Bearer admin-ACCESSTOKEN-1234"
 * 
 */
