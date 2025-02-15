const express = require('express');
const cron = require('node-cron');
const sendEmail = require('./emailService');
const checkForNewPosts = require('./fetcher');

const app = express();
const PORT = process.env.PORT || 4001;
//const PORT = process.env.TEST_PORT || 3001;

// Schedule the scraping task to run every 2 minutes
app.get('/scrape', async (req, res) => {
    try {
        const posts = await checkForNewPosts();
        await sendEmail(posts);
        res.json({ message: 'Scraping complete.', posts });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts or send email' });
    }
});

cron.schedule('* * * * *', async () => {
    console.log('\n🤖 Starting scheduled scraper...');
    console.log('⚡ [====             ] 25%');
    try {
        const posts = await checkForNewPosts();
        console.log('⚡ [========         ] 50%');
        await sendEmail(posts);
        console.log('⚡ [============     ] 75%');
        console.log('✨ [================] 100%');
        console.log('🎉 Scraping complete!');
        //console.log('📨 Found posts:', posts);
        console.log('📨 Found posts:', posts.length);
    } catch (error) {
        console.log('❌ Error occurred!');
        console.error('🚨 Error in scheduled scraper:', error);
    }
});

app.listen(PORT, () => {
    console.log('Welcome to the Reddit Job Hiring Alerts! 🤖');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
