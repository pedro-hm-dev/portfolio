export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return;

  const auth = useAuthStore();
  if (auth.isAuthenticated) return;

  const ok = await auth.refresh();
  if (!ok) return navigateTo("/admin/login");
});
