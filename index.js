// index.js
import express from "express";
import cors from "cors";
import pkg from "agora-access-token";
const { RtcTokenBuilder, RtcRole, RtmTokenBuilder, RtmRole } = pkg;


const app = express();
app.use(cors());
app.use(express.json());

// 🔒 use environment variables
const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

if (!APP_ID || !APP_CERTIFICATE) {
  console.error("Missing Agora credentials in environment variables!");
  process.exit(1);
}

// ---------------- RTC TOKEN ----------------
app.get("/rtc", (req, res) => {
  const channelName = req.query.channelName;
  if (!channelName) return res.status(400).json({ error: "channelName is required" });

  const uid = req.query.uid || 0;
  const role = RtcRole.PUBLISHER;
  const expireSeconds = 3600;
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpireTime
  );

  return res.json({ rtcToken: token });
});

// ---------------- RTM TOKEN ----------------
app.get("/rtm", (req, res) => {
  const uid = req.query.uid;
  if (!uid) return res.status(400).json({ error: "uid is required" });

  const expireSeconds = 3600;
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireSeconds;

  const token = RtmTokenBuilder.buildToken(
    APP_ID,
    APP_CERTIFICATE,
    uid,
    RtmRole.Rtm_User,
    privilegeExpireTime
  );

  return res.json({ rtmToken: token });
});

// ---------------- Default ----------------
app.get("/", (req, res) => {
  res.send("Agora Token Server is running ✅");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
