<template>
  <div class="bg-white rounded-lg p-4 shadow-md text-center w-48">
    <div class="text-xs text-gray-500">{{ exchange }}: {{ ticker }}</div>
    <div class="text-3xl font-bold text-gray-800">
      {{ price.toFixed(2) }}
      <span class="text-sm text-gray-500">USD</span>
    </div>
    <div
      :class="[
        'text-sm font-medium mt-1',
        change >= 0 ? 'text-green-600' : 'text-red-600',
      ]"
    >
      {{ change >= 0 ? "+" : "" }}{{ change.toFixed(2) }} ({{
        percentChange.toFixed(2)
      }}%)
      <span v-if="change >= 0" class="inline-block w-4 h-4 text-green-600">
        <!-- svg for arrow up -->
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4l-8 8h5v8h6v-8h5z" />
        </svg>
      </span>
      <span v-else class="inline-block w-4 h-4 text-red-600">
        <!-- svg for arrow down -->
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 20l8-8h-5v-8h-6v8h-5z" />
        </svg>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line no-undef
withDefaults(
  // eslint-disable-next-line no-undef
  defineProps<{
    exchange?: string;
    ticker: string;
    price: number;
    change: number;
    percentChange: number;
  }>(),
  {
    exchange: "NASDAQ", // default
  }
);
</script>
