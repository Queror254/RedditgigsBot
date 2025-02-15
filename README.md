# RedditgigsBot

A web application that scrapes job listings from Reddit's job-related subreddits and displays them in an organized format.

## Features

- Scrapes job postings from multiple subreddits (r/forhire, r/jobbit, etc.)
- Filters and categorizes jobs by type (Full-time, Part-time, Contract, etc.)
- Filter by keywords found in the job title (e.g. "Hiring", "Looking for", "Looking to hire", etc.)
- Regular updates to keep listings fresh
- Sends email notifications to the recipient email address

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Queror254/RedditgigsBot.git
   ```

2. Install dependencies:

   ```bash
   cd redditjobs
   npm install
   ```

3. Configure environment variables:

   - Copy `.env.example` to `.env`
   - Add your Reddit API credentials
   - link on how to create app password: https://medium.com/rails-to-rescue/how-to-set-up-smtp-credentials-with-gmail-for-your-app-send-email-cf236d11087d
   - Update other configuration as needed

4. Start the application:
   ```bash
   npm start
   ```

## Usage

1. Start the server:

   ```bash
   npm start
   ```

2. The server will run in the background and can be accessed via API endpoints.
3. Use tools like Postman or curl to interact with the API.
4. Browse available job listings through the API responses.
5. Use filters and search to find relevant positions via API requests.

## Running with PM2

1. Install PM2 globally if you haven't already:

   ```bash
   npm install -g pm2
   ```

2. Start the application using PM2:

   ```bash
   pm2 start npm --name "redditgigsbot" -- start
   ```

3. To view the status of your application:

   ```bash
   pm2 status
   ```

4. To stop the application:

   ```bash
   pm2 stop redditgigsbot
   ```

5. To restart the application:

   ```bash
   pm2 restart redditgigsbot
   ```

6. To view logs:

   ```bash
   pm2 logs redditgigsbot
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
