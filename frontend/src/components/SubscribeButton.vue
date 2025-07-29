<template>
  <button
    type="submit"
    class="bg-[#1998e1] hover:bg-blue-700 text-white ml-2 font-semibold text-lg"
    :disabled="loading"
    @click="handleSubscribe"
  >
    {{ loading ? "REDIRECTING TO CHECKOUT PAGE..." : "CONTINUE TO PAYMENT" }}
  </button>
</template>

<script setup>
import { ref } from "vue";
import { computed } from "vue";
import { useUserStore } from "@/stores/user";
import { useCsrfStore } from "@/stores/csrf";

const loading = ref(false);
const userStore = useUserStore();
const csrfStore = useCsrfStore();
const email = computed(() => userStore.user?.email || "");

const handleSubscribe = async () => {
  if (!email.value) {
    alert("You must be logged in to continue to payment.");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:3000/stripe/create-checkout-session",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfStore.token,
        },
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
  } finally {
    loading.value = false;
  }
};
</script>
