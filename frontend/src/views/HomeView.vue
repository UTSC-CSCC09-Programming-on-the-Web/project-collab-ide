<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" class="mx-auto" />
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />
    <div class="text-red-500 text-3xl font-bold">tailwind red text test!</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src

export default defineComponent({
  name: "HomeView",
  components: {
    HelloWorld,
  },
});
</script>
