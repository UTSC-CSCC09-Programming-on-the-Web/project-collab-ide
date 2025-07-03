<template>
  <div class="landing">
    <img src="@/assets/logo.png" alt="Stock Showdown Logo" class="logo" />
    <p class="description">
      Compete against other players in a 1v1 showdown to see how much money you
      can make with a volatile stock in 5 minutes.
    </p>
    <button class="start-button" @click="start">GET STARTED</button>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const start = () => {
  router.push("/login");
};
</script>

<style scoped>
.landing {
  margin-top: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 90vh;
  text-align: center;
  padding: 2rem 1rem 1rem;
}

.logo {
  max-width: 40%;
  height: auto;
  margin-bottom: 2.5rem;
}

.description {
  max-width: 700px;
  margin-bottom: 2.5rem;
  font-size: 1.2rem;
  font-family: "Roboto Condensed", sans-serif;
  font-weight: 400;
}

.start-button {
  background-color: #b71c1c;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-family: "Roboto Condensed", sans-serif;
  border-radius: 0.5rem;
  cursor: pointer;
}

.start-button:hover {
  background-color: #a01717;
}
</style>
