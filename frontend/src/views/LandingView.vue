<template>
  <div
    class="flex flex-col items-center justify-start min-h-screen pt-24 px-4 text-center bg-gray-50"
  >
    <img
      src="@/assets/logo.png"
      alt="Stock Showdown Logo"
      class="max-w-[60%] mb-10"
    />
    <p class="description max-w-xl mb-10 text-lg md:text-xl">
      Compete against other players in a 1v1 showdown to see how much money you
      can make with a volatile stock in 5 minutes.
    </p>
    <button
      class="start-button bg-red-700 hover:bg-red-800 text-white py-4 px-32 shadow-md font-semibold text-lg"
      @click="start"
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
  border-radius: 20px;
}

.start-button:hover {
  transform: translateY(-2px);
}
</style>
