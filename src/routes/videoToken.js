import express from 'express';
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

router.post('/', (req, res) => {
  const { identity, room } = req.body;

  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET
  );

  token.identity = identity;

  const videoGrant = new VideoGrant({ room });
  token.addGrant(videoGrant);

  res.send({ token: token.toJwt() });
});

export default router;
