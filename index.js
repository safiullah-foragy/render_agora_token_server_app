// index.js
const express = require("express");
const cors = require("cors");
const { RtcTokenBuilder, RtcRole, RtmTokenBuilder, RtmRole } = require("agora-access-token");

const app = express();
app.use(cors());
app.use(express.json());

// Load Agora credentials from environment variables
const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

if (!APP_ID || !APP_CERTIFICATE) {
  console.error("⚠️ Missing Agora credentials! Set APP_ID and APP_CERTIFICATE in environment variables.");
  process.exit(1);
}

// ---------------- RTC TOKEN ----------------
app.get("/rtc", (req, res) => {
  const channelName = req.query.channelName;
  if (!channelName) return res.status(400).json({ error: "channelName is required" });

  const uid = req.query.uid || 0;
  const role = RtcRole.PUBLISHER;
  const expireSeconds = 3600; // 1 hour
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireSeconds;

  const rtcToken = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpireTime
  );

  res.json({ rtcToken });
});

// ---------------- RTM TOKEN ----------------
app.get("/rtm", (req, res) => {
  const uid = req.query.uid;
  if (!uid) return res.status(400).json({ error: "uid is required" });

  const expireSeconds = 3600; // 1 hour
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireSeconds;

  const rtmToken = RtmTokenBuilder.buildToken(
    APP_ID,
    APP_CERTIFICATE,
    uid,
    RtmRole.Rtm_User,
    privilegeExpireTime
  );

  res.json({ rtmToken });
});

// ---------------- OPTIONAL: /all TOKEN ----------------
app.get("/all", (req, res) => {
  const channelName = req.query.channelName;
  const uid = req.query.uid || 0;

  if (!channelName) return res.status(400).json({ error: "channelName is required" });
  if (!uid) return res.status(400).json({ error: "uid is required" });

  const expireSeconds = 3600;
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireSeconds;

  const rtcToken = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    RtcRole.PUBLISHER,
    privilegeExpireTime
  );

  const rtmToken = RtmTokenBuilder.buildToken(
    APP_ID,
    APP_CERTIFICATE,
    uid,
    RtmRole.Rtm_User,
    privilegeExpireTime
  );

  res.json({ rtcToken, rtmToken });
});

// ---------------- Default Route ----------------
app.get("/", (req, res) => {
  res.send("Agora Token Server is running ✅");
});

// ---------------- Start Server ----------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
