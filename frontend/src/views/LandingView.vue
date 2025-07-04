<template>
  <div
    class="flex flex-col items-center justify-start min-h-screen pt-24 px-4 text-center bg-gray-50"
  >
    <img
      src="@/assets/logo.png"
      alt="Stock Showdown Logo"
      class="max-w-[40%] mb-10"
    />
    <p class="description max-w-xl mb-10 text-lg md:text-xl">
      Compete against other players in a 1v1 showdown to see how much money you
      can make with a volatile stock in 5 minutes.
    </p>
    <button
      @click="start"
      class="start-button bg-red-700 hover:bg-red-800 text-white py-3 px-8 rounded shadow-md"
    >
      GET STARTED
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const router = useRouter();

const start = () => {
  if (userStore.user) {
    router.push("/home");
  } else {
    router.push("/login");
  }
};
</script>

<style scoped>
.description {
  font-family: "Roboto Condensed", sans-serif;
  font-weight: 400;
}

.start-button {
  font-family: "Roboto Condensed", sans-serif;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.start-button:hover {
  transform: translateY(-2px);
}
</style>
