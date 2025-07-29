<template>
  <div class="home">
    <div class="absolute top-4 right-4 flex flex-col items-end space-y-4">
      <LogoutButton v-if="userStore.user" />
      <UnsubscribeButton v-if="userStore.user" />
    </div>

    <h1
      class="user-txt py-4 text-black mb-4 text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
    >
      HEY,
      <span class="text-[#197442]">{{
        userStore.$state.user?.username.toLocaleUpperCase()
      }}</span>
    </h1>
    <ErrorToast
      v-if="isError"
      :message="errorMessage"
      @close="isError = false"
    />
    <div
      v-if="matchId"
      class="enter-showdown-txt font-semibold mt-4 text-black"
    >
      MATCH FOUND!
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
    };
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
          { withCredentials: true }
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
