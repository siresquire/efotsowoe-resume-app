// index.js
var template = 'basic';
var devMode = false;

const Q = require('q');
const fs = require('fs');
const os = require('os');
const pdf = require('html-pdf');
const twig = require('twig');
const chalk = require('chalk');
const minimist = require('minimist')(process.argv.slice(2));
const cvData = require('./data/cv.json');
const PDFoptions = require('./pdf-options.json')
const express = require('express');
const router = express.Router();

// Configuration and helper functions
function getFileProtocolPath() {
    if( os.platform() === 'win32' ) {
        var path = __dirname.split('\\');
    } else {
        var path = __dirname.split('/');
    }
    path[0] = 'file://';
    return path.join('/');
}

function getRoot() {
    var root = getFileProtocolPath();
    if( devMode ) {
        return template;
    } else {
        return root + '/views/' + template;
    }
}

function checkTemplateFolder( templateId ) {
    try {
        fs.accessSync('views/' + templateId, fs.F_OK);
        console.log( chalk.green('Rendering template: ' + template) );
        return true;
    } catch (e) {
        console.log( chalk.red('Can\'t find template: ' + template) );
        return false;
    }
}

// Process command line arguments
if (minimist._.length > 0) {
    if (minimist._[0] == 'dev') {
        devMode = true;
        if (typeof minimist._[1] !== 'undefined') {
            template = minimist._[1];
            if( !checkTemplateFolder( template ) ) {
                return;
            }
        }
    } else {
        template = minimist._[0];
        if( !checkTemplateFolder( template ) ) {
            return;
        }
    }
}

// Setup template data
const meta = {
    template: template,
    devMode: devMode,
    root: getRoot()
}
cvData.meta = meta;
PDFoptions.base += template;

// Configure routes
router.get('/', function (req, res) {
    res.render(template + '/cv.twig', cvData);
});

// Export configurations and router
module.exports = {
    router,
    template,
    devMode,
    cvData,
    PDFoptions,
    renderPDF: function() {
        var createTemplate = Q.denodeify(twig.renderFile);
        return createTemplate('views/' + template + '/cv.twig', cvData)
            .then(function (html) {
                console.log(chalk.green('Looks good, just a second...'));
                var deferred = Q.defer()
                pdf.create(html, PDFoptions).toFile('./cv.pdf', (err, res) => {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(res);
                    }
                });
                return deferred.promise;
            });
    }
};

// server.js
const express = require('express');
const path = require('path');
const chalk = require('chalk');
const app = express();

// Import the main application logic
const mainApp = require('./index.js');

// Configure Twig
app.set("twig options", {
    strict_variables: false,
    cache: false,
    auto_reload: true
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('views'));

// Use the routes from index.js
app.use('/', mainApp.router);

// Generate PDF if not in dev mode
if (!mainApp.devMode) {
    mainApp.renderPDF()
        .then(() => {
            console.log(chalk.cyan('SUCCESS: Your CV is baked as ordered!'));
        })
        .catch((err) => {
            console.log(chalk.red('ERROR: ' + err));
        });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(chalk.red('Error:', err.stack));
    res.status(500).send('Something broke!');
});

// Handle 404s
app.use((req, res) => {
    res.status(404).send('Sorry, page not found!');
});

// Set port and start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(chalk.green(`Server running on http://0.0.0.0:${PORT}`));
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