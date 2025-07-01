<!--we dont need this if no landing/home-->
<template>
  <button
    @click="handleLogin"
    class="w-24 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition"
  >
    Login
  </button>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

function handleLogin() {
  router.push("/login");
}
</script>
