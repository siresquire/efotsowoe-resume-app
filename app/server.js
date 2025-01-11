const express = require('express');
const path = require('path');
const app = express();

// Import the main application logic
const mainApp = require('./index.js');

// Middleware to parse JSON and url-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the current directory
app.use(express.static(__dirname));

// Use the routes from index.js if it exports them
if (typeof mainApp === 'function') {
    app.use('/', mainApp);
} else if (mainApp.router) {
    app.use('/', mainApp.router);
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Handle 404s
app.use((req, res) => {
    res.status(404).send('Sorry, page not found!');
});

// Set port and start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle process termination gracefully
process.on('SIGTERM', () => {
    console.info('SIGTERM signal received. Closing server...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.info('SIGINT signal received. Closing server...');
    process.exit(0);
});