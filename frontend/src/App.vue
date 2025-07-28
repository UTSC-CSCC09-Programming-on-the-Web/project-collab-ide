<template>
  <head>
    <link
      href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
      rel="stylesheet"
    />
  </head>
  <div class="relative min-h-screen">
    <!-- Nav here for testing until flow is fully set up. -->
    <!-- <nav class="p-4">
      <router-link to="/">Landing</router-link> |
      <router-link to="/home">Home</router-link> |
      <router-link to="/subscription">Subscription</router-link> |
      <router-link to="/login">Login</router-link>
    </nav> -->

    <div class="absolute top-4 right-4 flex items-center space-x-4">
      <!-- <div v-if="userStore.user" class="text-green-500 text-sm md:text-base">
        Logged in as: {{ userStore.user.username }} ({{ userStore.user.email }})
      </div>
      <div v-else class="text-gray-500 text-sm md:text-base">
        Not logged in.
      </div> -->
    </div>

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { useCsrfStore } from "@/stores/csrf";

const userStore = useUserStore();
const csrfStore = useCsrfStore();

onMounted(async () => {
  try {
    fetch(`${process.env.VUE_APP_BACKEND_URL}/csrf-token`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(({ csrfToken }) => {
        csrfStore.setToken(csrfToken);
      })
      .catch((err) => {
        console.error("Failed to fetch CSRF token:", err);
      });

    const res = await fetch(`${process.env.VUE_APP_BACKEND_URL}/api/users/me`, {
      credentials: "include",
    });

    if (res.ok) {
      const userData = await res.json();
      userStore.setUser(userData);
      console.log("Logged in user:", userData);
    } else {
      console.error("Not logged in");
      userStore.clearUser();
    }
  } catch (err) {
    console.error("Error fetching /me:", err);
    userStore.clearUser();
  }
});
</script>

<style>
#app {
  font-family: "Roboto Condensed", "Bebas Neue", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
