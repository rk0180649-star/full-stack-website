const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Render cache directory set karta hai taaki Chrome safely persist ho
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};