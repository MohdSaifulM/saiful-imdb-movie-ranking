const express = require('express');
const cron = require('node-cron');
const scrapeRoutes = require('./routes/scrapeRoutes');
const { scrapeAndSave, compareRankings } = require('./scrape');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to use JSON
app.use(express.json());

// Use the scrape routes
app.use('/api', scrapeRoutes);

// Node-Cron job to run the scrape daily at midnight
// '0 0 * * *' --> At 00:00 on every day-of-month
// '*/10 * * * *' --> Every 10 minutes
cron.schedule('*/7 * * * *', async () => {
// cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled scrape...');
    try {
        const movies = await scrapeAndSave();
        if (movies && movies.length > 0) {
            console.log('Done scraping and saving movies');
        }
    } catch (error) {
        console.error('Error during scheduled scrape:', error);
    }
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
