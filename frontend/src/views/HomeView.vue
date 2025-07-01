<template>
  <div class="home">
    <!-- <img alt="Vue logo" src="../assets/logo.png" class="mx-auto" /> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" /> -->
    <div class="text-red-500 text-3xl font-bold">tailwind red text test!</div>
    <div v-if="user" class="mt-4 text-green-500">
      Logged in as: {{ user.username }} ({{ user.email }})
    </div>
    <div v-else class="mt-4 text-gray-500">Not logged in.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import HelloWorld from "@/components/HelloWorld.vue";

const user = ref<{ id: number; username: string; email: string } | null>(null);

onMounted(async () => {
  try {
    const res = await fetch(`${process.env.VUE_APP_BACKEND_URL}/api/auth/me`, {
      credentials: "include",
    });

    if (res.ok) {
      user.value = await res.json();
      console.log("Logged in user:", user.value);
    } else {
      console.error("Not logged in");
    }
  } catch (err) {
    console.error("Error fetching /me:", err);
  }
});
</script>
