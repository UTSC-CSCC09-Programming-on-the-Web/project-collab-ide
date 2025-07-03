<template>
  <div class="home">
    <ErrorToast
      v-if="isError"
      :message="errorMessage"
      @close="isError = false"
    />
    <div class="text-red-500 text-3xl font-bold">Find a Match</div>
    <button
      @click="joinQueue"
      class="w-full p-2 rounded bg-blue-500 text-white"
      :disabled="inQueue"
    >
      {{ inQueue ? "Waiting for Match..." : "Join Queue" }}
    </button>

    <button
      v-if="inQueue"
      @click="leaveQueue"
      class="w-full mt-2 p-2 rounded bg-red-500 text-white"
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
  },
  beforeUnmount() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  },
});
</script>
