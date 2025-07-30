<template>
  <button
    class="logout-btn w-40 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
    :disabled="loading"
    @click="handleUnsubscribe"
  >
    {{ loading ? "Unsubscribing..." : "UNSUBSCRIBE" }}
  </button>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useCsrfStore } from "@/stores/csrf";

const loading = ref(false);
const router = useRouter();
const userStore = useUserStore();
const csrfStore = useCsrfStore();

async function handleUnsubscribe() {
  loading.value = true;
  try {
    const unsubscribeRes = await fetch(
      `${process.env.VUE_APP_BACKEND_URL}/api/users/unsubscribe`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "CSRF-Token": csrfStore.token,
        },
      }
    );

    if (!unsubscribeRes.ok) {
      throw new Error("Unsubscribe failed");
    }

    const logoutRes = await fetch(
      `${process.env.VUE_APP_BACKEND_URL}/api/auth/logout`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "CSRF-Token": csrfStore.token,
        },
      }
    );

    if (!logoutRes.ok) {
      throw new Error("Logout failed");
    }

    userStore.clearUser();
    router.push("/login");
  } catch (err) {
    console.error("Unsubscribe error:", err);
    alert("Something went wrong while unsubscribing.");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.unsubscribe-btn {
  font-family: "Roboto Condensed", sans-serif;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
}
.unsubscribe-btn:hover {
  transform: translateY(-2px);
}
.unsubscribe-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
