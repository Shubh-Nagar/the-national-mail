// Startup file for cPanel "Setup Node.js App" (Phusion Passenger).
// Passenger loads startup files with require(), and the API is an ES module,
// so this CommonJS wrapper imports it instead.
import('./src/server.js').catch((err) => {
  console.error(err);
  process.exit(1);
});
