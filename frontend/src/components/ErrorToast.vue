<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow-lg flex items-center space-x-2 z-50"
    >
      <span>{{ message }}</span>
      <button class="text-white hover:text-gray-200" @click="close">
        &times;
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

// eslint-disable-next-line no-undef
const props = defineProps<{
  message: string;
  duration?: number; // in ms
}>();

const visible = ref(true);

const close = () => {
  visible.value = false;
};

onMounted(() => {
  setTimeout(() => {
    visible.value = false;
  }, props.duration ?? 4000);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
