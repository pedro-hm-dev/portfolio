export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;
  // Skip admin routes — they don't count as portfolio visits
  if (to.path.startsWith("/admin")) return;

  const session = useSessionStore();
  session.init();
  session.trackPage(to.path);
});
