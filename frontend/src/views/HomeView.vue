<template>
  <div class="home">
    <h1 class="user-txt text-black mb-4">
      HEY,
      <span class="text-[#197442]">{{
        userStore.$state.user?.username.toLocaleUpperCase()
      }}</span>
    </h1>
    <div class="stock-display-demo justify-items-center mb-2">
      <button
        class="w-full mt-2 p-2 mb-4 rounded bg-purple-500 text-white"
        @click="getMarketData"
      >
        Test: Simulate updating stock display!
      </button>
      <StockDisplay
        exchange="NASDAQ"
        ticker="AAPL"
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
    <div
      v-if="matchId"
      class="enter-showdown-txt font-semibold mt-4 text-black"
    >
      MATCH FOUND! Match ID: {{ matchId }}
    </div>
    <div
      v-else-if="inQueue"
      class="enter-showdown-txt font-semibold mt-4 text-black"
    >
      FINDING MATCH ...
    </div>
    <div v-else class="enter-showdown-txt text-black font-semibold mt-4">
      ENTER A 1V1 SHOWDOWN
    </div>
    <div class="flex flex-col items-center">
      <button
        class="join-queue-btn font-semibold text-white"
        :disabled="inQueue"
        @click="joinQueue"
      >
        {{ inQueue ? "IN QUEUE" : "PLAY" }}
      </button>

      <button
        v-if="inQueue"
        class="leave-queue-btn font-semibold rounded-lg mt-2 p-2 bg-red-500 text-white"
        @click="leaveQueue"
      >
        CANCEL
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from "vue";
import { useUserStore } from "@/stores/user";
import ErrorToast from "@/components/ErrorToast.vue";
import StockDisplay from "@/components/StockDisplay.vue";

export default defineComponent({
  components: {
    ErrorToast,
    StockDisplay,
  },
  data() {
    return {
      userStore: useUserStore(),
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
          if (this.pollInterval) clearInterval(this.pollInterval);

          setTimeout(() => {
            this.$router.push({
              name: "MatchPage",
              params: { id: this.matchId },
            });
          }, 2000);
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

<style scoped>
.user-txt {
  font-family: "Bebas Neue", sans-serif;
  font-size: 4rem;
}
.enter-showdown-txt {
  font-family: "Roboto Condensed", sans-serif;
  font-size: 1.5rem;
  padding: 0.7rem;
}

.join-queue-btn {
  font-family: "Roboto Condensed", sans-serif;
  padding: 0.5rem;
  border-radius: 0.7rem;
  background-color: #1998e1;
  width: 20vw;
  color: white;
}

.leave-queue-btn {
  font-family: "Roboto Condensed", sans-serif;
  padding: 0.5rem;
  border-radius: 0.7rem;
  width: 20vw;
  color: white;
}
</style>
