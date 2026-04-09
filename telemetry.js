const https = require('https');
const http = require('http');

const DASHBOARD_URL = process.env.DASHBOARD_URL || 'https://ropseyys-bot.onrender.com';
const PING_INTERVAL_MS = 30000;

let startTime = Date.now();
let intervalRef = null;

function sendHeartbeat(extraData = {}) {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  const payload = JSON.stringify({
    username: extraData.username || 'unknown',
    serverIP: extraData.serverIP || 'unknown',
    status: extraData.status || 'online',
    uptimeSeconds,
    timestamp: Date.now(),
  });

  try {
    const url = new URL(`${DASHBOARD_URL}/api/heartbeat`);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const req = lib.request({
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => { res.resume(); });

    req.on('error', () => {});
    req.write(payload);
    req.end();
  } catch (e) {}
}

function startTelemetry(bot, serverIP) {
  startTime = Date.now();

  sendHeartbeat({ username: bot.username, serverIP, status: 'online' });

  intervalRef = setInterval(() => {
    sendHeartbeat({ username: bot.username, serverIP, status: 'online' });
  }, PING_INTERVAL_MS);

  bot.on('end', () => {
    sendHeartbeat({ username: bot.username, serverIP, status: 'offline' });
    clearInterval(intervalRef);
  });

  bot.on('kicked', () => {
    sendHeartbeat({ username: bot.username, serverIP, status: 'kicked' });
    clearInterval(intervalRef);
  });
}

module.exports = { startTelemetry };
