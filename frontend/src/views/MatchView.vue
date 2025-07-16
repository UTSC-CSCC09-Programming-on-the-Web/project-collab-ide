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

    <!-- Right Side (Opponent) -->
    <div
      class="w-1/2 bg-[#252525] text-white flex flex-col items-center justify-center space-y-4"
    >
      <h2 class="text-2xl font-bold">
        OPPONENT: {{ opponentUserId ?? "..." }}
      </h2>
      <div class="space-y-1 w-[300px]">
        <div class="flex justify-between">
          <span>CASH</span>
          <span class="font-bold">{{ opponentCash.toFixed(2) }} USD</span>
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
import { defineComponent, watch } from "vue";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import StockDisplay from "@/components/StockDisplay.vue";
import { useUserStore } from "@/stores/user";

export default defineComponent({
  components: { StockDisplay },
  data() {
    return {
      userStore: useUserStore(),
      socket: null as Socket | null,
      opponentUserId: null as number | null,
      opponentCash: 100.0,
      playerCash: 100.0,
      playerShares: 0,
      currentPrice: 179.76,
      priceChange: 2.85,
      percentChange: 1.61,
      buyInput: "",
      sellInput: "",
      stockData: [] as Candle[],
      tickInterval: null as ReturnType<typeof setInterval> | null,
    };
  },
  mounted() {
    watch(
      () => this.userStore.user,
      (user) => {
        if (user?.id) {
          this.setupSocket(user.id);
        }
      },
      { immediate: true }
    );
  },
  beforeUnmount() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    if (this.socket) this.socket.disconnect();
  },
  methods: {
    setupSocket(myUserId: number) {
      const matchId = this.$route.params.id;
      this.socket = io("http://localhost:3000", { withCredentials: true });

      this.socket.on("connect", () => {
        this.socket!.emit("join-match", matchId);
      });

      this.socket.on("buy-event", ({ userId, amount }) => {
        if (userId === myUserId) return;
        this.opponentCash -= amount;
        this.opponentUserId = userId;
      });

      this.socket.on("sell-event", ({ userId, amount }) => {
        if (userId === myUserId) return;
        const sharesSold = amount / this.currentPrice;
        this.opponentCash += amount;
        this.opponentUserId = userId;
      });
    },
    buyStock() {
      const amount = parseFloat(this.buyInput);
      if (isNaN(amount) || amount <= 0 || amount > this.playerCash) return;
      const shares = amount / this.currentPrice;
      this.playerShares += shares;
      this.playerCash -= amount;
      this.socket?.emit("buy", { matchId: this.$route.params.id, amount });
      this.buyInput = "";
    },
    sellStock() {
      const amount = parseFloat(this.sellInput);
      const shares = amount / this.currentPrice;
      if (isNaN(amount) || amount <= 0 || shares > this.playerShares) return;
      this.playerShares -= shares;
      this.playerCash += amount;
      this.socket?.emit("sell", { matchId: this.$route.params.id, amount });
      this.sellInput = "";
    },
    async getMarketData() {
      try {
        const res = await axios.get(
          `${process.env.VUE_APP_BACKEND_URL}/api/market/candles`,
          {
            params: { ticker: "AAPL", date: "2023-08-02", page: 0, limit: 60 },
            withCredentials: true,
          }
        );
        this.stockData = res.data.candles;

        if (this.tickInterval) clearInterval(this.tickInterval);

        let index = 0;
        this.tickInterval = setInterval(() => {
          if (index >= this.stockData.length) {
            clearInterval(this.tickInterval!);
            this.tickInterval = null;
            return;
          }
          const candle = this.stockData[index];
          const newPrice = candle.close;
          const oldPrice = this.currentPrice;
          this.currentPrice = newPrice;
          this.priceChange = newPrice - oldPrice;
          this.percentChange = ((newPrice - oldPrice) / oldPrice) * 100;
          index++;
        }, 1000);
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
