<script setup lang="ts">
import GoogleIcon from "@/components/GoogleIcon.vue";

const loginWithGoogle = () => {
  window.location.href = `${process.env.VUE_APP_BACKEND_URL}/api/auth/google`;
};
</script>

<template>
  <div class="flex flex-col items-center justify-center mt-12">
    <h1 class="title">SIGN IN</h1>
    <button
      class="flex items-center justify-center bg-white border border-gray-600 rounded px-4 py-2 max-w-xs hover:shadow focus:outline-none"
      @click="loginWithGoogle"
    >
      <GoogleIcon />
      <span class="sign-in-with-google ml-2 font-semibold text-lg"
        >Sign in with Google</span
      >
    </button>
  </div>
</template>

<style scoped>
.title {
  font-family: "Bebas Neue", sans-serif;
  font-size: 10rem;
  color: #197442;
}

.sign-in-with-google {
  font-family: "Roboto Condensed", sans-serif;
}
</style>
