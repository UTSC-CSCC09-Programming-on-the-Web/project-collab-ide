import express from "express";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
  const { email } = req.body;

  try {
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
      success_url: `http://localhost:${process.env.FRONTEND_PORT}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:${process.env.FRONTEND_PORT}/cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

export { router as checkoutRouter };
