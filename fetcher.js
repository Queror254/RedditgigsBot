const axios = require('axios');
const fs = require('fs');
const csvParser = require("csv-parser");
//const { postLimit } = require('./config');

const CSV_FILE = './posts.csv'
//process.env.CSV_FILE;

const DELAY_BETWEEN_REQUESTS = 2000;

async function fetchHiringPosts() {
    try {
        const allHiringPosts = [];
        let after = null;
        const maxPages = 10; // Fetch up to 10 pages
        const postsPerPage = 100;

        // Expanded job-related subreddits focused on programming
        const jobSubreddits = new Set([
            'forhire', 'hiring', 'hireaprogrammer', 'remotejs',
            'javascript_jobs', 'pythonjobs', 'phpjobs', 'nodejsjobs',
            'reactjobs', 'vuejobs', 'developerjobs', 'webdev_jobs'
        ]);

        // Tech-focused hiring keywords
        const hiringKeywords = [
            'hiring', '[hiring]', 'job opening', 'job opportunity',
            'position available', 'we are looking'
        ];

        // Programming-related keywords to filter posts
        const techKeywords = [
            'developer', 'engineer', 'programmer', 'software', 'web dev', 'web developer', 'react developer',
            'full stack', 'fullstack', 'backend', 'frontend', 'back end', 'front end', 'react native',
            'python', 'javascript', 'js', 'typescript', 'java', 'app developer',
            'php', 'ruby', 'golang', 'rust', 'c#', '.net', 'node', 'nodejs', 'node.js', 'react native developer',
            'react', 'angular', 'vue', 'django', 'flask', 'laravel', 'flutter', 'flutter developer',
            'aws', 'devops', 'cloud', 'api', 'sql', 'database', 'database developer', 'mySQL', 'mysql',
            'mobile', 'ios', 'android', 'kotlin', 'swift', 'scraper', 'scraping',
        ];

        for (let page = 0; page < maxPages; page++) {
            const REDDIT_API_URL = `https://www.reddit.com/user/grandmaster_infinite/m/test_feed/new.json?limit=${postsPerPage}${after ? `&after=${after}` : ''}`
            //const REDDIT_API_URL = `https://www.reddit.com/new.json?limit=${postsPerPage}${after ? `&after=${after}` : ''}`;

            const response = await axios.get(REDDIT_API_URL, {
                headers: {
                    "User-Agent": "MyHiringBot/1.0 (by /u/YOUR_USERNAME)",
                },
            });

            const posts = response.data.data.children;
            after = response.data.data.after;

            const hiringPosts = posts
                .filter(post => {
                    const title = post.data.title.toLowerCase();
                    const body = post.data.selftext.toLowerCase();
                    const subreddit = post.data.subreddit.toLowerCase();

                    // Check if post is from a tech job subreddit
                    const isJobSubreddit = jobSubreddits.has(subreddit);

                    // Check for hiring keywords in title (now required)
                    const hasHiringKeyword = hiringKeywords.some(keyword =>
                        title.includes(keyword.toLowerCase())
                    );

                    // Check for tech-related keywords in title or body
                    const hasTechKeyword = techKeywords.some(keyword =>
                        title.includes(keyword.toLowerCase()) ||
                        body.includes(keyword.toLowerCase())
                    );

                    // Check for hiring flair
                    const hasHiringFlair = post.data.link_flair_css_class === 'fh-hiring' ||
                        post.data.link_flair_css_class === 'hiring';

                    // Check if post is not marked as closed
                    const isNotClosed = !title.includes('closed') &&
                        !title.includes('filled') &&
                        !title.includes('position filled');

                    // Now requiring hasHiringKeyword in the return condition
                    return hasHiringKeyword &&
                        hasTechKeyword &&
                        isNotClosed &&
                        (isJobSubreddit || hasHiringFlair);
                })
                .map(post => ({
                    title: post.data.title,
                    author: post.data.author,
                    url: `https://reddit.com${post.data.permalink}`,
                    subreddit: post.data.subreddit,
                    created: new Date(post.data.created_utc * 1000).toISOString(),
                    body: post.data.selftext,
                    score: post.data.score,
                    isJobSubreddit: jobSubreddits.has(post.data.subreddit.toLowerCase()),
                    techKeywordsFound: findTechKeywords(post.data.title, post.data.selftext, techKeywords)
                }));

            allHiringPosts.push(...hiringPosts);

            // If no more posts to fetch, break the loop
            if (!after) break;

            // Add delay between requests
            await delay(DELAY_BETWEEN_REQUESTS);
        }

        console.log(`🔔 Found ${allHiringPosts.length} potential hiring posts`);
        return allHiringPosts;

    } catch (error) {
        console.error('Error in fetchHiringPosts:', error.message);
        return [];
    }
}

// Helper function for delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

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

// Helper function to find tech keywords in post
function findTechKeywords(title, body, techKeywords) {
    const text = (title + ' ' + body).toLowerCase();
    return techKeywords.filter(keyword => text.includes(keyword.toLowerCase()));
}

module.exports = checkForNewPosts;



