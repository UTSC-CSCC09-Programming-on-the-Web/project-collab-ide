<script setup lang="ts">
import GoogleIcon from "@/components/GoogleIcon.vue";

const loginWithGoogle = () => {
  window.location.href = `${process.env.VUE_APP_BACKEND_URL}/api/auth/google`;
};
</script>

<template>
  <div class="flex justify-center mt-12">
    <button
      class="flex items-center justify-center bg-white border border-gray-400 rounded px-4 py-2 max-w-xs hover:shadow focus:outline-none"
      @click="loginWithGoogle"
    >
      <GoogleIcon />
      <span class="ml-2 font-medium text-sm">Sign in with Google</span>
    </button>
  </div>
</template>
