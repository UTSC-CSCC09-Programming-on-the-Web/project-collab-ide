import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
  const user = ref<{ id: number; username: string; email: string } | null>(
    null,
  );

  function setUser(newUser: typeof user.value) {
    user.value = newUser;
  }

  function clearUser() {
    user.value = null;
  }

  return { user, setUser, clearUser };
});
