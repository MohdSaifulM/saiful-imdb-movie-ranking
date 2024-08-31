const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Function to scrape IMDb and save data
const scrapeAndSave = async () => {
    try {

        let startTime = performance.now();
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        // Navigate to IMDb Top 250 page
        await page.goto('https://www.imdb.com/chart/top', {
            waitUntil: 'networkidle2'
        });

        // Wait for the list to load
        await page.waitForSelector('.ipc-metadata-list li.ipc-metadata-list-summary-item');

        // Extract initial movie information including selectors for further interaction
        const movies = await page.$$eval('.ipc-metadata-list li.ipc-metadata-list-summary-item', rows => {
            return rows.map(row => {
                const title = row.querySelector('h3.ipc-title__text').innerText.split('.')[1].trim();
                const rank = +row.querySelector('h3.ipc-title__text').innerText.split('.')[0].trim();
                const released_year = row.querySelector('span.cli-title-metadata-item').innerText;

                // Store necessary information to find the director later
                const iconSelector = '.cli-post-element';
                const rowIndex = [...row.parentNode.children].indexOf(row); // Capture the row index to interact with it later
                return { title, rank, released_year, iconSelector, rowIndex };
            });
        });

        // Iterate over each movie and extract the director's name
        for (let movie of movies) {
            if (movie.iconSelector) {
                const icon = await page.$$(movie.iconSelector); // Get all icons
                if (icon[movie.rowIndex]) { // Use the index to interact with the correct icon
                    await icon[movie.rowIndex].click(); // Click to open the pop-up

                    // Wait for the pop-up to appear and extract the director's name
                    await page.waitForSelector('.ipc-promptable-dialog .ipc-promptable-base__content a.ipc-link');
                    movie.director = await page.$eval('.ipc-promptable-base__content a.ipc-link', el => el.innerText);

                    // Close the pop-up
                    await page.click('.ipc-promptable-base__close');
                    await page.waitForSelector('.ipc-promptable-dialog', { hidden: true }); // Ensure the pop-up is closed
                } else {
                    movie.director = 'N/A';
                }
                // Delete the iconSelector and rowIndex as they are no longer needed
                delete movie.iconSelector;
                delete movie.rowIndex;
            } else {
                movie.director = 'N/A';
            }
        }

        // Close the browser
        let endTime = performance.now();

        console.log(`Scraping took ${((endTime - startTime) / 60000).toFixed(2)} minutes`);

        await browser.close();

        // Compare the rankings after scraping
        const rankingChanges = compareRankings(movies);

        // Generate timestamp in YYYYMMDDHHmm format
        const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
        const filePath = path.join(dataDir, `movies-${timestamp}.json`);
        fs.writeFileSync(filePath, JSON.stringify(rankingChanges, null, 2), 'utf-8');

        console.log(`Data saved to ${filePath}`);
    } catch (error) {
        console.error('Error during scraping:', error);
    }
};

// Function to compare current and previous scrape
const compareRankings = (currentMovies) => {
    const files = fs.readdirSync(dataDir).filter(file => file.startsWith('movies-') && file.endsWith('.json'));
    if (files.length > 0) {
        const previousFilePath = path.join(dataDir, files[files.length - 1]);
        const previousMovies = JSON.parse(fs.readFileSync(previousFilePath, 'utf-8'));

        const rankingChanges = currentMovies.map(movie => {
            const previousMovie = previousMovies.find(prev => prev.title === movie.title);
            if (previousMovie) {
                const rankChange = previousMovie.rank - movie.rank;
                return {
                    ...movie,
                    previousRank: previousMovie.rank,
                    rank: movie.rank,
                    rankChange
                };
            } else {
                return {
                    ...movie,
                    previousRank: 'N/A',
                    rank: movie.rank,
                    rankChange: 'New'
                }
            }
        });

        return rankingChanges;
    } else {
        return currentMovies.map(movie => ({
            ...movie,
            previousRank: 'N/A',
            rankChange: 'New'
        }));
    }
}

module.exports = { scrapeAndSave, compareRankings };
