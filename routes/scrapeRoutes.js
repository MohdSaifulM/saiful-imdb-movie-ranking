const express = require('express');
const { scrapeAndSave, compareRankings } = require('../scrape');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Route to manually trigger the scrape
router.get('/scrape', async (req, res) => {
    try {
        const movies = await scrapeAndSave();
        res.json({
            message: 'Scrape complete',
            movies
        });
    } catch (error) {
        res.status(500).json({ message: 'Error during scraping', error: error.message });
    }
});

// Route to view the last scrape results
router.get('/last-scrape', (req, res) => {
    const dataDir = path.join(__dirname, '../data');
    const files = fs.readdirSync(dataDir).filter(file => file.startsWith('movies-') && file.endsWith('.json'));
    if (files.length > 0) {
        const lastFilePath = path.join(dataDir, files[files.length - 1]);
        const lastMovies = JSON.parse(fs.readFileSync(lastFilePath, 'utf-8'));
        res.json(lastMovies);
    } else {
        res.status(404).json({ message: 'No data found' });
    }
});

module.exports = router;
