<template>
  <button
    class="logout-btn w-40 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
    :disabled="loading"
    @click="handleLogout"
  >
    {{ loading ? "Logging out..." : "LOGOUT" }}
  </button>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const loading = ref(false);
const router = useRouter();
const userStore = useUserStore();

async function handleLogout() {
  loading.value = true;
  try {
    await fetch(`${process.env.VUE_APP_BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    userStore.clearUser();
    router.push("/");
  } catch (err) {
    console.error("Failed to logout:", err);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.logout-btn {
  font-family: "Roboto Condensed", sans-serif;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
}
.logout-btn:hover {
  transform: translateY(-2px);
}
.logout-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
