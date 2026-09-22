// Vercel serverless entry — only /api/* hits this file.
// Static HTML/CSS/JS are served by Vercel CDN automatically.
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const app = require("../server");

module.exports = app;
