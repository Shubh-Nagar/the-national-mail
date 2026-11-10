// Startup file for cPanel "Setup Node.js App" (Phusion Passenger).
// Serves the production build in .next (run "npm run build" first).
const { createServer } = require('node:http');
const next = require('next');

const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(process.env.PORT || 3000);
});
