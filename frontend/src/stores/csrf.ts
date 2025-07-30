import { defineStore } from "pinia";
import { ref } from "vue";

export const useCsrfStore = defineStore("csrf", () => {
  const token = ref<string>("");

  function setToken(newToken: string) {
    token.value = newToken;
  }

  function clearToken() {
    token.value = "";
  }

  return { token, setToken, clearToken };
});
