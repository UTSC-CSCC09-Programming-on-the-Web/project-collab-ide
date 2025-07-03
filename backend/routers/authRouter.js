import { Router } from "express";
import { User } from "../models/user.js";
import { isValidStr } from "../utils/validation.js";
import axios from "axios";
import jwt from "jsonwebtoken";

export const authRouter = Router();
const PROD_ENV = "production";

// GET /google: redirect to google auth url
authRouter.get("/google", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    // TODO:
  });

  const googleOAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.redirect(googleOAuthURL);
});

// GET /google/callback: exchange token
authRouter.get("/google/callback", async (req, res) => {
  const code = req.query.code;
  if (!isValidStr(code)) {
    return res.status(400).send("Invalid arguments: code is required.");
  }

  try {
    const params = new URLSearchParams({
      code: code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.BACKEND_URL}/api/auth/google/callback`,
      grant_type: "authorization_code",
    });

    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      params.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    );

    const { id_token } = tokenResponse.data;
    if (!id_token) {
      console.error(tokenResponse.data);
      return res
        .status(500)
        .send("An error occured: Failed to retrieve id_token from Google.");
    }

    const userInfo = jwt.decode(id_token);

    let user = await User.findOne({ where: { googleId: userInfo.sub } });
    if (!user) {
      user = await User.create({
        googleId: userInfo.sub,
        email: userInfo.email,
        username: userInfo.name,
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    // signed with id, email, usrname
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === PROD_ENV,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.FRONTEND_URL}/home`);
  } catch (err) {
    console.error(err.response?.data || err);
    res
      .status(500)
      .send("An error occured during the OAuth process. Please try again :(");
  }
});

// POST /logout: clear JWT cookie and log out
authRouter.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === PROD_ENV,
    sameSite: "lax",
  });
  res.status(200).json({ message: "Logged out successfully." });
});
