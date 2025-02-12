require('dotenv').config();

module.exports = {
    gmailUser: process.env.SMTP_USER,
    gmailPass: process.env.SMTP_PASS,
    recipientEmail: process.env.RECIPIENT_EMAIL,
    postLimit: parseInt(process.env.POST_LIMIT, 10) || 5,
};
