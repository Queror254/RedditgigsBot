const axios = require('axios');
const fs = require('fs');
const csvParser = require("csv-parser");
//const { postLimit } = require('./config');

const CSV_FILE = './posts.csv'
//process.env.CSV_FILE;


async function fetchHiringPosts() {
    try {
        const subreddits = ['forhire', 'hiring'];
        const postLimit = 20;
        const allHiringPosts = [];
        for (const subreddit of subreddits) {
            const REDDIT_API_URL = `https://www.reddit.com/r/${subreddit}/new.json?limit=${postLimit}`;

            const response = await axios.get(REDDIT_API_URL, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                },
            });
            const posts = response.data.data.children;

            const hiringPosts = posts
                .filter(post => post.data.link_flair_css_class === 'fh-hiring')
                .map(post => ({
                    title: post.data.title,
                    author: post.data.author,
                    url: post.data.url,
                    subreddit: post.data.subreddit
                }));

            allHiringPosts.push(...hiringPosts);
        }

        return allHiringPosts;
    } catch (error) {
        console.error('Error fetching Reddit posts:', error.message);
        return [];
    }
}

function loadPreviousPosts() {
    return new Promise((resolve, reject) => {
        const previousPosts = new Set();
        if (!fs.existsSync(CSV_FILE)) return resolve(previousPosts);

        fs.createReadStream(CSV_FILE)
            .pipe(csvParser({ headers: false }))
            .on("data", (row) => previousPosts.add(row[0].trim())) // Trim for consistency
            .on("end", () => resolve(previousPosts))
            .on("error", reject);
    });
}

function saveNewPosts(posts) {
    const csvContent = posts.map(post => `"${post.title}"\n`).join("");
    fs.writeFileSync(CSV_FILE, csvContent, { flag: 'a' }); // Append, but in correct format
}

async function checkForNewPosts() {
    const newPosts = await fetchHiringPosts();
    if (newPosts.length === 0) {
        console.log("🔍 No new posts found.");
        return [];
    }

    const previousPosts = await loadPreviousPosts();
    const filteredPosts = newPosts.filter(post => !previousPosts.has(post.title));

    if (filteredPosts.length === 0) {
        console.log("✅ No new posts since last check.");
        return [];
    } else {
        console.log(`🔔 Found ${filteredPosts.length} new posts. Updating CSV.`);
        saveNewPosts(filteredPosts);
        return filteredPosts;
    }
}

module.exports = checkForNewPosts;



