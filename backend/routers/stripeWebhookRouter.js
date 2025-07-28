import express from "express";
import Stripe from "stripe";
import { User } from "../models/user.js";

export const stripWebhookRouter = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const MISSING_CUSTOMER_EMAIL = "Missing customer email.";

stripWebhookRouter.post(
  "",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Completed checkout
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const email = session.customer_email;
      const subscriptionId = session.subscription;

      if (!email) {
        console.error("Error: Stripe session completed, but no email found.");
        return res.status(400).send(MISSING_CUSTOMER_EMAIL);
      }

      const [updated] = await User.update(
        {
          isSubscribed: true,
          stripeSubId: subscriptionId,
        },
        { where: { email, isSubscribed: false } },
      );

      if (updated) {
        console.log(`User ${email} subscription was activated.`);
      } else {
        console.log(`User ${email} was already subscribed or not found.`);
      }
    }

    // Cancellde Subscription
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const customer = await stripe.customers.retrieve(subscription.customer);
      const email = customer.email;

      if (!email) {
        console.error("Error: Subscription was cancelled but no email was found.");
        return res.status(400).send(MISSING_CUSTOMER_EMAIL);
      }

      console.log(`Subscription was cancelled for ${email}`);
      await User.update(
        {
          isSubscribed: false,
          stripeSubId: null,
        },
        { where: { email } },
      );
    }
    res.status(200).end();
  },
);
