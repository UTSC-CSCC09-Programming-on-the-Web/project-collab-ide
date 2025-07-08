<template>
  <div class="home">
    <div class="stock-display-demo justify-items-center mb-2">
      <button
        class="w-full mt-2 p-2 mb-4 rounded bg-purple-500 text-white"
        @click="getMarketData"
      >
        Test: Simulate updating stock display!
      </button>
      <StockDisplay
        exchange="NASDAQ"
        ticker="GOOG"
        :price="currentPrice"
        :change="priceChange"
        :percent-change="percentChange"
      />
    </div>
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
import StockDisplay from "@/components/StockDisplay.vue";

export default defineComponent({
  components: {
    ErrorToast,
    StockDisplay,
  },
  data() {
    return {
      inQueue: false as boolean,
      matchId: null as number | null,
      userId: 123 as number,
      pollInterval: null as ReturnType<typeof setInterval> | null,
      isError: false as boolean,
      errorMessage: "" as string,
      currentPrice: 179.76, // state for cur price
      priceChange: 2.85, // state for price change
      percentChange: 1.61, // state for perc change
      stockData: [] as Candle[], // store the fetched data
      tickInterval: null as ReturnType<typeof setInterval> | null, // for demo- for game we might want to tick from backend
    };
  },
  beforeUnmount() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.tickInterval) clearInterval(this.tickInterval);
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
              date: "2023-08-02",
              page: 0,
              limit: 60, // fetch 60 candles for simulation
            },
            withCredentials: true,
          }
        );
        console.log("Market Candle Data:", res.data);
        this.stockData = res.data.candles;

        if (this.tickInterval) clearInterval(this.tickInterval);

        let index = 0;
        this.tickInterval = setInterval(() => {
          if (index >= this.stockData.length) {
            if (this.tickInterval !== null) {
              clearInterval(this.tickInterval);
              this.tickInterval = null;
            }
            return;
          }
          const candle = this.stockData[index];
          const newPrice = candle.close;
          const oldPrice = this.currentPrice;
          this.currentPrice = newPrice;
          this.priceChange = newPrice - oldPrice;
          this.percentChange = ((newPrice - oldPrice) / oldPrice) * 100;
          index++;
        }, 1000); // update every second
      } catch (err: any) {
        console.error(err.response?.data || err.message);
      }
    },
  },
});

type Candle = {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};
</script>
