const http = require('http');
const { exec } = require('child_process');

// Start Playwright server in background
exec('npx playwright run-server --port 3000 --host 0.0.0.0', (err, stdout, stderr) => {
  if (err) console.error(err);
});

// Start a tiny HTTP server to satisfy Render's Health Check
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Playwright Server is up');
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Health check server running on port ${process.env.PORT || 3000}`);
});
