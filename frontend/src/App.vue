<template>
  <div class="relative min-h-screen">
    <nav class="p-4">
      <router-link to="/">Home</router-link> |
      <router-link to="/subscription">Subscription</router-link> |
      <router-link to="/login">Login</router-link>
    </nav>

    <div class="absolute top-4 right-4 flex items-center space-x-4">
      <div v-if="userStore.user" class="text-green-500 text-sm md:text-base">
        Logged in as: {{ userStore.user.username }} ({{ userStore.user.email }})
      </div>
      <div v-else class="text-gray-500 text-sm md:text-base">
        Not logged in.
      </div>
      <LogoutButton v-if="userStore.user" />
      <!-- Login button not needed unless we have landing -->
      <!--<LoginButton v-else />-->
    </div>

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import LogoutButton from "@/components/LogoutButton.vue";
import LoginButton from "@/components/LoginButton.vue";

const userStore = useUserStore();

onMounted(async () => {
  try {
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
  font-family: Avenir, Helvetica, Arial, sans-serif;
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
