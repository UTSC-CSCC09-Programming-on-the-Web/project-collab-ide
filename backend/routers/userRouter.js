import { Router } from "express";
import { User } from "../models/user.js";
import { isAuthenticated } from "../middleware/auth.js";

export const userRouter = Router();

// GET /users/me
userRouter.get("/me", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: ["id", "email", "username"],
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: `User with id ${userId} does not exist.` });
    }

    res.json(user);
  } catch (err) {
    console.error("Error in GET users/me:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /users/unsubscribe
userRouter.post("/unsubscribe", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res
        .status(404)
        .json({ error: `User with id ${userId} does not exist.` });
    }

    user.isSubscribed = false;
    await user.save();

    res.status(200).json({ message: "Unsubscribed and updated user status." });
  } catch (err) {
    console.error("Error in POST users/unsubscribe:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});
