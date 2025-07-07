<template>
  <div class="home">
    <button
      class="w-full mt-2 p-2 rounded bg-purple-500 text-white"
      @click="getMarketData"
    >
      Test: Console Log Market Data
    </button>
    <ErrorToast
      v-if="isError"
      :message="errorMessage"
      @close="isError = false"
    />
    <div class="text-red-500 text-3xl font-bold">Find a Match</div>
    <button
      class="w-full p-2 rounded bg-blue-500 text-white"
      :disabled="inQueue"
      @click="joinQueue"
    >
      {{ inQueue ? "Waiting for Match..." : "Join Queue" }}
    </button>

    <button
      v-if="inQueue"
      class="w-full mt-2 p-2 rounded bg-red-500 text-white"
      @click="leaveQueue"
    >
      Cancel
    </button>

    <div v-if="matchId" class="mt-4 text-green-600">
      Match found! Match ID: {{ matchId }}
    </div>
  </div>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from "vue";
import ErrorToast from "@/components/ErrorToast.vue";

export default defineComponent({
  components: {
    ErrorToast,
  },
  data() {
    return {
      inQueue: false as boolean,
      matchId: null as number | null,
      userId: 123 as number,
      pollInterval: null as ReturnType<typeof setInterval> | null,
      isError: false as boolean,
      errorMessage: "" as string,
    };
  },
  beforeUnmount() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  },
  methods: {
    async joinQueue() {
      this.isError = false;
      try {
        await axios.post(
          `${process.env.VUE_APP_BACKEND_URL}/api/queue/join`,
          {},
          { withCredentials: true }
        );
        this.inQueue = true;
        this.startPolling();
      } catch (err: any) {
        this.isError = true;
        this.errorMessage =
          err.response?.data?.error ||
          err?.message ||
          "An unexpected error occurred.";
        console.error(err.response?.data || err.message);
      }
    },
    async leaveQueue() {
      try {
        await axios.post(
          `${process.env.VUE_APP_BACKEND_URL}/api/queue/leave`,
          {},
          { withCredentials: true }
        );
        this.inQueue = false;
        if (this.pollInterval) clearInterval(this.pollInterval);
      } catch (err: any) {
        console.error(err.response?.data || err.message);
      }
    },
    async checkMatchStatus() {
      try {
        const res = await axios.get(
          `${process.env.VUE_APP_BACKEND_URL}/api/match/status`,
          { withCredentials: true }
        );
        if (res.data.matchId) {
          this.matchId = res.data.matchId;
          this.inQueue = false;
          if (this.pollInterval) clearInterval(this.pollInterval);
        }
      } catch (err: any) {
        console.error(err.response?.data || err.message);
      }
    },
    startPolling() {
      this.pollInterval = setInterval(this.checkMatchStatus, 3000);
    },
    async getMarketData() {
      try {
        const res = await axios.get(
          `${process.env.VUE_APP_BACKEND_URL}/api/market/candles`,
          {
            params: {
              ticker: "AAPL",
              date: "2023-08-02", // get valid dates from endpoint /api/market/dates
              page: 0,
              limit: 1,
            },
            withCredentials: true,
          }
        );
        console.log("Market Candle Data:", res.data);
      } catch (err: any) {
        console.error(err.response?.data || err.message);
      }
    },
  },
});
</script>
