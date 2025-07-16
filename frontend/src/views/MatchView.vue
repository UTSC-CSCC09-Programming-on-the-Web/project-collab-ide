<template>
  <div class="flex h-screen w-screen">
    <!-- Left Side (YOU) -->
    <div
      class="w-1/2 bg-[#125C87] text-white flex flex-col items-center justify-center space-y-4"
    >
      <h2 class="text-4xl font-bold">YOU</h2>
      <div class="space-y-1 w-[300px]">
        <div class="flex justify-between">
          <span>CASH</span>
          <span class="font-bold">{{ playerCash.toFixed(2) }} USD</span>
        </div>
        <div class="flex justify-between">
          <span>STOCK OWNED</span>
          <span class="font-bold"
            >{{ (playerShares * currentPrice).toFixed(2) }} USD</span
          >
        </div>
        <div class="flex justify-between">
          <span>TOTAL VALUE</span>
          <span class="font-bold"
            >{{
              (playerCash + playerShares * currentPrice).toFixed(2)
            }}
            USD</span
          >
        </div>
      </div>
      <div class="space-y-2">
        <div class="flex space-x-2">
          <input
            v-model="buyInput"
            type="text"
            class="px-2 py-1 rounded text-black"
            placeholder="$"
          />
          <button
            @click="buyStock"
            class="bg-[#782ACC] w-28 px-4 py-1 rounded text-white"
          >
            BUY
          </button>
        </div>
        <div class="flex space-x-2">
          <input
            v-model="sellInput"
            type="text"
            class="px-2 py-1 rounded text-black"
            placeholder="$"
          />
          <button
            @click="sellStock"
            class="bg-[#782ACC] w-28 px-4 py-1 rounded text-white"
          >
            SELL
          </button>
        </div>
      </div>
    </div>

    <!-- Right Side (CHARLES) -->
    <div
      class="w-1/2 bg-[#252525] text-white flex flex-col items-center justify-center space-y-4"
    >
      <h2 class="text-2xl font-bold">CHARLES</h2>
      <div class="text-xl font-bold">100.00 USD</div>
      <div class="space-y-2">
        <div class="flex space-x-2">
          <input
            type="text"
            class="px-2 py-1 rounded text-black"
            placeholder="$"
          />
          <button class="bg-[#782ACC] w-28 px-4 py-1 rounded text-white">
            BUY
          </button>
        </div>
        <div class="flex space-x-2">
          <input
            type="text"
            class="px-2 py-1 rounded text-black"
            placeholder="$"
          />
          <button class="bg-[#782ACC] w-28 px-4 py-1 rounded text-white">
            SELL
          </button>
        </div>
      </div>
    </div>
    <!-- Center Overlay (Stock Display + Timer) -->
    <div
      class="absolute top-0 left-1/2 transform -translate-x-1/2 w-full flex flex-col items-center pt-8 pointer-events-auto"
    >
      <div class="text-white text-6xl font-bebas">5:00</div>
      <StockDisplay
        exchange="NASDAQ"
        ticker="AAPL"
        :price="currentPrice"
        :change="priceChange"
        :percent-change="percentChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";
import StockDisplay from "@/components/StockDisplay.vue";

export default defineComponent({
  components: {
    StockDisplay,
  },
  data() {
    return {
      isError: false as boolean,
      errorMessage: "" as string,
      currentPrice: 179.76, // state for cur price
      priceChange: 2.85, // state for price change
      percentChange: 1.61, // state for perc change
      playerCash: 100.0,
      playerShares: 0,
      buyInput: "",
      sellInput: "",
      stockData: [] as Candle[], // store the fetched data
      tickInterval: null as ReturnType<typeof setInterval> | null, // for demo- for game we might want to tick from backend
    };
  },
  beforeUnmount() {
    if (this.tickInterval) clearInterval(this.tickInterval);
  },
  methods: {
    buyStock() {
      const amount = parseFloat(this.buyInput);
      if (isNaN(amount) || amount <= 0 || amount > this.playerCash) return;
      const sharesToBuy = amount / this.currentPrice;
      this.playerShares += sharesToBuy;
      this.playerCash -= amount;
      this.buyInput = "";
    },
    sellStock() {
      const amount = parseFloat(this.sellInput);
      const sharesToSell = amount / this.currentPrice;
      if (isNaN(amount) || amount <= 0 || sharesToSell > this.playerShares)
        return;
      this.playerShares -= sharesToSell;
      this.playerCash += amount;
      this.sellInput = "";
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
