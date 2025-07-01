import { Router } from "express";

export const authRouter = Router();

// GET /google: redirect to google auth url
authRouter.get("/google", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  const googleOAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.redirect(googleOAuthURL);
});