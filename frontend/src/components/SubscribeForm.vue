<template>
  <form @submit.prevent="handleSubscribe">
    <input
      v-model="email"
      type="email"
      placeholder="Enter your email"
      required
    />
    <button type="submit">Subscribe</button>
  </form>
</template>

<script setup>
import { ref } from "vue";

const email = ref("");

const handleSubscribe = async () => {
  try {
    const response = await fetch(
      "http://localhost:3000/stripe/create-checkout-session",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.value }),
      }
    );

    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Failed to get checkout URL");
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
  }
};
</script>
