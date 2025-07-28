<template>
  <div class="flex h-screen w-screen">
    <!-- Left Side (YOU) -->
    <div
      v-if="isMatchActive && !isMatchEnded"
      class="w-1/2 bg-[#125C87] text-white flex flex-col items-center justify-start space-y-4 pt-56"
    >
      <div class="text-center">
        <h2 class="text-4xl font-bold">YOU</h2>
      </div>

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
            class="bg-[#782ACC] w-28 px-4 py-1 rounded text-white hover:bg-[#6520a8] transition-colors"
            @click="buyStock"
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
            class="bg-[#782ACC] w-28 px-4 py-1 rounded text-white hover:bg-[#6520a8] transition-colors"
            @click="sellStock"
          >
            SELL
          </button>
        </div>
      </div>
    </div>

    <!-- Right Side (Opponent) -->
    <div
      v-if="isMatchActive && !isMatchEnded"
      class="w-1/2 bg-[#252525] text-white flex flex-col items-center justify-start space-y-4 pt-56"
    >
      <h2 class="text-4xl font-bold">
        {{ opponentDisplayName.toLocaleUpperCase() }}
      </h2>
      <div class="space-y-1 w-[300px]">
        <div class="flex justify-between">
          <span>CASH</span>
          <span class="font-bold">{{ opponentCash.toFixed(2) }} USD</span>
        </div>
        <div class="flex justify-between">
          <span>STOCK OWNED</span>
          <span class="font-bold"
            >{{ (opponentShares * currentPrice).toFixed(2) }} USD</span
          >
        </div>
        <div class="flex justify-between">
          <span>TOTAL VALUE</span>
          <span class="font-bold">{{ opponentTotalValue.toFixed(2) }} USD</span>
        </div>
      </div>
    </div>

    <!-- Center Overlay (Stock Display + Timer) -->
    <div
      class="absolute top-0 left-1/2 transform -translate-x-1/2 w-full flex flex-col items-center pt-8 pointer-events-auto"
    >
      <!-- Timer -->
      <div
        class="text-6xl font-bebas mb-4"
        :class="timeRemaining <= 30 ? 'text-red-500' : 'text-white'"
      >
        {{ formatTime(timeRemaining) }}
      </div>

      <!-- Match Status -->
      <div
        v-if="!isMatchActive && !isMatchEnded"
        class="text-yellow-500 text-xl mb-4"
      >
        Waiting for players... ({{ playersInMatch }}/2)
      </div>

      <StockDisplay
        v-if="isMatchActive && !isMatchEnded"
        :exchange="exchange"
        :ticker="ticker"
        :price="currentPrice"
        :change="priceChange"
        :percent-change="percentChange"
      />
    </div>

    <!-- End-of-Match Results Layout -->
    <div v-if="isMatchEnded" class="flex h-screen w-screen">
      <!-- Center Overlay (Timer + Message) -->
      <div
        class="absolute top-0 left-1/2 transform -translate-x-1/2 w-full flex flex-col items-center pt-8 pointer-events-auto"
      >
        <!-- Timer -->
        <div
          class="text-6xl font-bebas mb-4"
          :class="timeRemaining <= 30 ? 'text-red-500' : 'text-white'"
        >
          {{ formatTime(timeRemaining) }}
        </div>
        <!-- Winner Message -->
        <div
          class="bg-white text-black font-bold px-8 py-8 rounded-lg text-center text-lg shadow-lg"
        >
          {{
            matchResultText === "WINNER"
              ? `CONGRATS ${userStore.user?.username.toUpperCase()}!`
              : matchResultText === "TIE"
              ? "IT'S A TIE!"
              : `CONGRATS ${opponentDisplayName.toUpperCase()}!`
          }}
        </div>
      </div>

      <!-- LEAVE MATCH BUTTON -->
      <div class="absolute bottom-20 left-1/2 transform -translate-x-1/2">
        <button
          class="bg-[#782ACC] hover:bg-[#6520a8] text-white font-semibold px-24 py-2 rounded-lg text-lg transition-colors shadow-lg"
          @click="goHome"
        >
          LEAVE MATCH
        </button>
      </div>

      <!-- YOU VIEW -->
      <div
        class="w-1/2 bg-[#252525] text-white flex flex-col items-center justify-start space-y-4 pt-52"
      >
        <!-- WINNER / LOSER / TIE label -->
        <div class="text-2xl font-bold" :class="matchResultClass">
          {{ matchResultText }}
        </div>
        <div class="text-4xl font-light">YOU</div>
        <div class="text-center pt-8">
          <div class="flex items-baseline space-x-1">
            <span class="text-6xl font-bold" :class="matchResultClass">{{
              playerTotalValue.toFixed(2)
            }}</span>
            <span class="text-white text-3xl font-light">USD</span>
          </div>
        </div>
      </div>

      <!-- Opponent VIEW -->
      <div
        class="w-1/2 bg-[#252525] text-white flex flex-col items-center justify-start space-y-4 pt-64"
      >
        <div class="text-4xl font-bold">
          {{ opponentDisplayName.toUpperCase() }}
        </div>
        <div class="flex items-baseline space-x-1 pt-8">
          <span class="text-6xl font-bold">{{
            opponentTotalValue.toFixed(2)
          }}</span>
          <span class="text-white text-2xl font-light">USD</span>
        </div>
      </div>
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

      // Timer & Match State
      timeRemaining: 180,
      isMatchActive: false,
      isMatchEnded: false,
      playersInMatch: 0,

      // Player & Opponent Data
      opponentUserId: null as number | null,
      opponentUsername: null as string | null,
      opponentCash: 100.0,
      opponentShares: 0.0,
      opponentBuyInput: "",
      opponentSellInput: "",
      playerCash: 100.0,
      playerShares: 0,
      isHost: false,

      // Stock Data
      exchange: "NASDAQ",
      ticker: "AAPL",
      currentPrice: 179.76,
      priceChange: 2.85,
      percentChange: 1.61,
      buyInput: "",
      sellInput: "",
      stockData: [] as Candle[],
      tickInterval: null as ReturnType<typeof setInterval> | null,
    };
  },
  computed: {
    playerTotalValue(): number {
      return this.playerCash + this.playerShares * this.currentPrice;
    },
    opponentTotalValue(): number {
      return this.opponentCash + this.opponentShares * this.currentPrice;
    },
    opponentDisplayName(): string {
      if (this.opponentUsername) {
        return this.opponentUsername;
      } else if (this.opponentUserId) {
        return `User ${this.opponentUserId}`;
      } else {
        return "Waiting for opponent...";
      }
    },

    matchResultText(): string {
      if (!this.isMatchEnded) return "";

      if (this.playerTotalValue > this.opponentTotalValue) {
        return "WINNER";
      } else if (this.playerTotalValue < this.opponentTotalValue) {
        return "LOSER";
      } else {
        return "TIE";
      }
    },

    matchResultClass(): string {
      if (!this.isMatchEnded) return "";

      if (this.playerTotalValue > this.opponentTotalValue) {
        return "text-green-400 animate-pulse";
      } else if (this.playerTotalValue < this.opponentTotalValue) {
        return "text-red-400";
      } else {
        return "text-yellow-400";
      }
    },

    winnerMessage(): string {
      if (!this.isMatchEnded) return "";

      if (this.playerTotalValue > this.opponentTotalValue) {
        return `CONGRATS ${
          this.userStore.user?.username?.toUpperCase() || "YOU"
        }!`;
      } else if (this.playerTotalValue < this.opponentTotalValue) {
        return `CONGRATS ${this.opponentDisplayName.toUpperCase()}!`;
      } else {
        return "IT'S A TIE!";
      }
    },
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
      this.socket = io(process.env.VUE_APP_BACKEND_URL, {
        withCredentials: true,
      });

      this.socket.on("connect", () => {
        console.log("Connected to server");
        this.socket?.emit("join-match", matchId);
      });

      // Update opponent information when they join
      this.socket.on(
        "player-info",
        ({ userId, username }: { userId: number; username: string }) => {
          if (userId !== myUserId) {
            this.opponentUserId = userId;
            this.opponentUsername = username;
          }
        }
      );

      // Listen for timer updates from backend
      this.socket.on("timer-update", (data: { timeRemaining: number }) => {
        this.timeRemaining = data.timeRemaining;
      });

      // Listen for your portfolio updates
      this.socket.on(
        "portfolio-update",
        ({ cash, shares }: { cash: number; shares: number }) => {
          this.playerCash = cash;
          this.playerShares = shares;
        }
      );

      // Listen for opponent trades
      this.socket.on(
        "opponent-trade",
        ({
          userId,
          type,
          amount,
          inputValue,
          cash,
          shares,
        }: {
          userId: number;
          type: string;
          amount: number;
          inputValue?: string;
          cash: number;
          shares: number;
        }) => {
          if (userId === myUserId) return;

          // Update opponent's full portfolio data
          this.opponentUserId = userId;
          this.opponentCash = cash;
          this.opponentShares = shares;

          // Show how much opponent bought/sold for 2 seconds
          if (type === "buy" && inputValue) {
            this.opponentBuyInput = inputValue;
            setTimeout(() => {
              this.opponentBuyInput = "";
            }, 2000);
          } else if (type === "sell" && inputValue) {
            this.opponentSellInput = inputValue;
            setTimeout(() => {
              this.opponentSellInput = "";
            }, 2000);
          }
        }
      );

      // Listen for match start
      this.socket.on(
        "match-started",
        (data: {
          matchId: string;
          hostUserId: number;
          marketCombo: {
            ticker: string;
            market: string;
            marketDate: string;
          };
        }) => {
          this.isMatchActive = true;
          this.isMatchEnded = false;
          this.playersInMatch = 2;

          this.isHost = this.userStore.user?.id === data.hostUserId;

          if (this.isHost) {
            this.getMarketData(
              data.marketCombo.market,
              data.marketCombo.ticker,
              data.marketCombo.marketDate
            );
          } else {
            this.exchange = data.marketCombo.market;
            this.ticker = data.marketCombo.ticker;
          }
        }
      );

      // Listen for match end
      this.socket.on("match-ended", (data: { timeRemaining: number }) => {
        this.isMatchEnded = true;
        this.isMatchActive = false;
        this.timeRemaining = 0;

        if (this.tickInterval) {
          clearTimeout(this.tickInterval);
          this.tickInterval = null;
        }
      });

      // Existing trading events
      this.socket.on(
        "buy-event",
        ({ userId, amount }: { userId: number; amount: number }) => {
          if (userId === myUserId) return;
          this.opponentCash -= amount;
          this.opponentUserId = userId;
        }
      );

      this.socket.on(
        "sell-event",
        ({ userId, amount }: { userId: number; amount: number }) => {
          if (userId === myUserId) return;
          const sharesSold = amount / this.currentPrice;
          this.opponentCash += amount;
          this.opponentUserId = userId;
        }
      );

      this.socket.on(
        "price-update",
        (data: { price: number; change: number; percentChange: number }) => {
          this.currentPrice = data.price;
          this.priceChange = data.change;
          this.percentChange = data.percentChange;
        }
      );
    },

    formatTime(seconds: number): string {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    },

    buyStock() {
      if (!this.isMatchActive || this.isMatchEnded) return;

      const amount = parseFloat(this.buyInput);
      if (isNaN(amount) || amount <= 0) return;

      this.socket?.emit("buy", { matchId: this.$route.params.id, amount });
      this.buyInput = "";
    },

    sellStock() {
      if (!this.isMatchActive || this.isMatchEnded) return;

      const amount = parseFloat(this.sellInput);
      if (isNaN(amount) || amount <= 0) return;

      this.socket?.emit("sell", { matchId: this.$route.params.id, amount });
      this.sellInput = "";
    },

    goHome() {
      this.$router.push("/home");
    },
    async getMarketData(market: string, ticker: string, marketDate: string) {
      if (!this.isMatchActive) return;
      try {
        const res = await axios.get(
          `${process.env.VUE_APP_BACKEND_URL}/api/market/candles`,
          {
            params: {
              market: market,
              ticker: ticker,
              date: marketDate,
              page: 0,
              limit: 180,
            },
            withCredentials: true,
          }
        );
        this.stockData = res.data.candles;
        this.exchange = market;
        this.ticker = ticker;
        let index = 0;

        const updatePrice = () => {
          if (index >= this.stockData.length || this.isMatchEnded) {
            return;
          }

          const candle = this.stockData[index];
          const newPrice = candle.close;
          const oldPrice = this.currentPrice;
          this.currentPrice = newPrice;
          this.priceChange = newPrice - oldPrice;
          this.percentChange = ((newPrice - oldPrice) / oldPrice) * 100;

          // Emit to server for sync
          this.socket?.emit("stock-update", {
            matchId: this.$route.params.id,
            price: newPrice,
            change: this.priceChange,
            percentChange: this.percentChange,
          });

          index++;

          // Continue updating if match is still active
          if (!this.isMatchEnded) {
            const randomDelay = Math.floor(Math.random() * 3 + 1) * 1000;
            this.tickInterval = setTimeout(updatePrice, randomDelay);
          }
        };

        // Kick off the first price update
        updatePrice();
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
