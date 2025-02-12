const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send an email with latest hiring posts
 * @param {Array} posts - List of hiring posts
 */
async function sendEmail(posts) {
    if (posts.length === 0) {
        console.log('No new hiring posts. Skipping email.');
        return;
    }

    const emailBody = posts.map(post =>
        `<h3>${post.title}</h3>
        <p>Subreddit: ${post.subreddit}</p>
        <p>${post.data.selftext}</p>
        <p><a href=${post.url}>View Post</a></p>`
    ).join('<hr>');

    const SMTP_USER = 'querortech.int@gmail.com';
    const RECIPIENT_EMAIL = 'mwendavictorm@gmail.com';
    const mailOptions = {
        from: `"Reddit Hiring Alerts" <${SMTP_USER}>`,
        to: RECIPIENT_EMAIL,
        subject: `🚀 New Hiring Posts on r/forhire (${posts.length} posts)`,
        html: emailBody,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully ✅`);
    } catch (error) {
        console.error('❌ Error sending email: ❌ ', error.message);
    }
}

module.exports = sendEmail;
