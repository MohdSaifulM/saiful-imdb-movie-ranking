# IMDb Top 250 Scraper

This project is a Node.js application that scrapes IMDb's Top 250 movies list, compares rankings between scrapes, and saves the results to JSON files. The application uses Puppeteer for web scraping, Node-Cron for scheduling periodic scrapes, and Express.js to provide an API for triggering scrapes and viewing the results.

## Features

- **Web Scraping:** Scrapes IMDb's Top 250 movies, including movie titles, ranks, release years, and directors.
- **Ranking Comparison:** Compares the current rankings with the previous scrape and tracks changes.
- **Data Storage:** Saves the scraped and updated data to a JSON file, timestamped for historical tracking.
- **Scheduling:** Automatically scrapes IMDb every midnight using a cron job.
- **API Endpoints:** Provides endpoints to manually trigger a scrape and view the latest scrape results.

## Project Structure
```
/project
│
├── /data                 # Directory where scraped data will be stored
├── /routes               # Directory for route handlers
│   └── scrapeRoutes.js   # Route handlers for scraping
├── app.js                # Main application file
├── scrape.js             # Scraping logic
├── package.json          # Project dependencies and scripts
└── README.md             # Project documentation
```

## Installation

1. **Install the dependencies:**
`npm install`
2. **Ensure the data directory exists:**
The scrape.js script will automatically create the data directory if it doesn't exist. This directory is used to store the JSON files containing the scraped data.

## Usage

### Running the Application

1. **Start the Express server:**
`npm start`
2. **Access the API:**
- Trigger a manual scrape:
  - Endpoint: GET /api/scrape
  - URL: http://localhost:3000/api/scrape
  - This will scrape the IMDb Top 250 list, compare it with the previous scrape, and save the results.
- View the last scrape results:
  - Endpoint: GET /api/last-scrape
  - URL: http://localhost:3000/api/last-scrape
  - This will return the results of the most recent scrape.

### Automatic Scraping
The application is configured to automatically scrape IMDb's Top 250 list every UTC midnight using Node-Cron. The cron job is defined in app.js

### Data Storage
- The scraped data is saved as JSON files in the data directory.
- Each file is named with a timestamp in the YYYYMMDDHHmm format.
- If it’s the first scrape, the comparison will assume no previous data exists and set the ranking changes to new for all movies.

### Handling Edge Cases
- First-Time Scrape: If no previous file exists, the script will handle the first scrape gracefully by setting rankChange = 'New' for all movies.
- Error Handling: If any errors occur during the scrape or comparison process, they will be logged, and the application will continue running.
