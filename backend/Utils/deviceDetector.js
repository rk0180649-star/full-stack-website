// server/Utils/deviceDetector.js
const UAParser = require("ua-parser-js");
const geoip = require("geoip-lite");

function getClientDetails(req) {
  const userAgent = req.headers["user-agent"] || "";
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  // Real IP extract karna (reverse proxy / cloudflare / local)
  let ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  // Localhost IP handling
  if (ip === "::1" || ip === "127.0.0.1") {
    ip = "103.251.167.22"; // Local testing ke liye sample Indian IP
  }

  // Geolocation lookup
  const geo = geoip.lookup(ip);

  // Device type identify karna (desktop, mobile, tablet)
  let deviceType = result.device.type || "desktop";

  return {
    browserName: result.browser.name || "Unknown",
    browserVersion: result.browser.version || "Unknown",
    os: `${result.os.name || "Unknown"} ${result.os.version || ""}`.trim(),
    deviceType: deviceType,
    deviceModel: result.device.model || "Desktop/PC",
    ipAddress: ip,
    city: geo?.city || "Unknown",
    country: geo?.country || "Unknown",
  };
}

module.exports = { getClientDetails };