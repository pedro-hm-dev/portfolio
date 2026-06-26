import type { LoginResponse, PublicUser } from "@portfolio/types";

export const useAuthStore = defineStore("auth", () => {
  const config = useRuntimeConfig();

  const token = ref<string | null>(null);
  const user = ref<PublicUser | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  async function login(email: string, password: string): Promise<LoginResponse> {
    const res = await $fetch<LoginResponse>("/auth/login", {
      method: "POST",
      baseURL: config.public.apiBase,
      credentials: "include",
      body: { email, password },
    });
    token.value = res.accessToken;
    user.value = res.user;
    return res;
  }

  async function refresh(): Promise<boolean> {
    try {
      const res = await $fetch<LoginResponse>("/auth/refresh", {
        method: "POST",
        baseURL: config.public.apiBase,
        credentials: "include",
      });
      token.value = res.accessToken;
      user.value = res.user;
      return true;
    } catch {
      token.value = null;
      user.value = null;
      return false;
    }
  }

  async function logout(): Promise<void> {
    try {
      await $fetch("/auth/logout", {
        method: "POST",
        baseURL: config.public.apiBase,
        credentials: "include",
        headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
      });
    } finally {
      token.value = null;
      user.value = null;
    }
  }

  return { token, user, isAuthenticated, login, refresh, logout };
});
