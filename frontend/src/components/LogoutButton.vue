<template>
  <button
    @click="handleLogout"
    class="w-24 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition disabled:opacity-50"
    :disabled="loading"
  >
    {{ loading ? "Logging out..." : "Logout" }}
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
