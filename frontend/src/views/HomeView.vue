<template>
  <div class="home flex h-screen w-screen px-8 py-6 space-x-8">
    <!-- LEFT: Match History -->
    <div class="w-1/3">
      <h2
        class="text-black font-bold mb-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl pt-12"
      >
        MATCH HISTORY
      </h2>
      <div
        v-if="matchHistory.length === 0"
        class="sm:text-sm md:text-md lg:text-lg text-gray-600"
      >
        You have no match history yet.
      </div>
      <ul v-else class="space-y-3">
        <li
          v-for="match in matchHistory"
          :key="match.id"
          class="border p-4 rounded-lg shadow-md bg-gray-100"
        >
          <p
            class="text-lg font-bold"
            :class="{
              'text-green-600': match.winnerId === userStore.user?.id,
              'text-red-600': match.loserId === userStore.user?.id,
            }"
          >
            {{ match.winnerId === userStore.user?.id ? "WIN" : "LOSS" }}
          </p>
          <p class="text-sm">STOCK: {{ match.stockTicker || "AAPL" }}</p>
          <p class="text-sm">
            TIME: {{ new Date(match.startTime).toLocaleString() }}
          </p>
          <p class="text-sm text-green-600 font-semibold">
            YOUR PAYOUT:
            {{
              match.player1Id === userStore.user?.id
                ? match.player1Payout
                : match.player2Payout
            }}
          </p>
        </li>
      </ul>
    </div>

    <!-- CENTER: Main Content -->
    <div
      class="w-1/3 flex-1 flex flex-col items-center justify-start space-y-4"
    >
      <h1
        class="user-txt text-black mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
      >
        HEY,
        <span class="text-[#197442]">{{
          userStore.$state.user?.username.toUpperCase()
        }}</span>
      </h1>

      <ErrorToast
        v-if="isError"
        :message="errorMessage"
        @close="isError = false"
      />

      <div v-if="matchId" class="text-xl font-semibold text-black">
        MATCH FOUND!
      </div>
      <div v-else-if="inQueue" class="text-xl font-semibold text-black">
        FINDING MATCH ...
      </div>
      <div v-else class="text-xl font-semibold text-black">
        ENTER A 1V1 SHOWDOWN
      </div>

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
    <!-- Top Right Buttons -->
    <div class="w-1/3 flex flex-col items-end space-y-4">
      <LogoutButton v-if="userStore.user" />
      <UnsubscribeButton v-if="userStore.user" />
    </div>
  </div>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from "vue";
import { useUserStore } from "@/stores/user";
import { useCsrfStore } from "@/stores/csrf";
import ErrorToast from "@/components/ErrorToast.vue";
import LogoutButton from "@/components/LogoutButton.vue";
import UnsubscribeButton from "@/components/UnsubscribeButton.vue";

import { useRouter } from "vue-router";

export default defineComponent({
  components: {
    LogoutButton,
    UnsubscribeButton,
    ErrorToast,
  },
  data() {
    return {
      userStore: useUserStore(),
      csrfStore: useCsrfStore(),
      inQueue: false as boolean,
      matchId: null as number | null,
      userId: 123 as number,
      pollInterval: null as ReturnType<typeof setInterval> | null,
      isError: false as boolean,
      errorMessage: "" as string,
      router: useRouter(),
      matchHistory: [] as any[],
    };
  },
  async mounted() {
    await this.fetchMatchHistory();
  },
  methods: {
    async joinQueue() {
      this.isError = false;
      try {
        await axios.post(
          `${process.env.VUE_APP_BACKEND_URL}/api/queue/join`,
          {},
          {
            withCredentials: true,
            headers: {
              "CSRF-Token": this.csrfStore.token,
            },
          }
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
          {
            withCredentials: true,
            headers: {
              "CSRF-Token": this.csrfStore.token,
            },
          }
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
          { withCredentials: true },
        );
        if (res.data.matchId) {
          this.matchId = res.data.matchId;
          if (this.pollInterval) clearInterval(this.pollInterval);

          setTimeout(() => {
            this.router.push({
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
    async fetchMatchHistory() {
      try {
        const res = await axios.get(
          `${process.env.VUE_APP_BACKEND_URL}/api/match/history`,
          { withCredentials: true }
        );
        this.matchHistory = res.data.matches;
      } catch (err: any) {
        console.error("Failed to load match history", err.message);
      }
    },
  },
});
</script>

<style scoped>
.user-txt {
  font-family: "Bebas Neue", sans-serif;
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
