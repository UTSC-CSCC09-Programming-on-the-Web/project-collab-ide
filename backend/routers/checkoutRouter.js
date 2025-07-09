import express from "express";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "secret");

router.post("/create-checkout-session", async (req, res) => {
  const { email } = req.body;

  try {

    // If user exists, update subscription status
    const user = await User.findOne({ where: { email } });
    if (user) {
      user.isSubscribed = true;
      await user.save();
    } else {
      return res.status(404).json({ error: "User not found" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.PRICE_ID,
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: `${process.env.FRONTEND_URL}/home`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

export { router as checkoutRouter };
