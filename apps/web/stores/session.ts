import type { VisitorTechnicalData, VisitorLocationData, VisitorBehavioralData } from "@portfolio/types";

export const useSessionStore = defineStore("session", () => {
  const startTime = ref(0);
  const pagesVisited = ref<string[]>([]);
  const projectsViewed = ref<string[]>([]);
  const postsViewed = ref<string[]>([]);
  const locationLoaded = ref(false);

  const technicalData = ref<VisitorTechnicalData>({});
  const locationData = ref<VisitorLocationData>({});

  function init() {
    if (startTime.value) return;
    startTime.value = Date.now();
  }

  function trackPage(path: string) {
    if (!pagesVisited.value.includes(path)) {
      pagesVisited.value.push(path);
    }
  }

  function trackProject(slug: string) {
    if (!projectsViewed.value.includes(slug)) {
      projectsViewed.value.push(slug);
    }
  }

  function trackPost(slug: string) {
    if (!postsViewed.value.includes(slug)) {
      postsViewed.value.push(slug);
    }
  }

  function collectTechnicalData() {
    if (import.meta.server) return;
    technicalData.value = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${window.screen.width}×${window.screen.height}`,
      referrer: document.referrer || undefined,
      colorScheme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    };
  }

  async function collectLocationData() {
    if (import.meta.server || locationLoaded.value) return;
    locationLoaded.value = true;
    try {
      const res = await $fetch<{
        status: string;
        country: string;
        regionName: string;
        city: string;
      }>("http://ip-api.com/json?fields=status,country,regionName,city");
      if (res.status === "success") {
        locationData.value = {
          country: res.country,
          region: res.regionName,
          city: res.city,
        };
      }
    } catch {
      // location data is optional — fail silently
    }
  }

  function getTimeOnSite(): number {
    if (!startTime.value) return 0;
    return Math.round((Date.now() - startTime.value) / 1000);
  }

  function getBehavioralData(tourCompleted = false): VisitorBehavioralData {
    return {
      pagesVisited: [...pagesVisited.value],
      projectsViewed: [...projectsViewed.value],
      postsViewed: [...postsViewed.value],
      timeOnSite: getTimeOnSite(),
      tourCompleted,
    };
  }

  function formatTimeOnSite(): string {
    const s = getTimeOnSite();
    if (s < 60) return `${s} segundos`;
    const m = Math.floor(s / 60);
    const r = s % 60;
    return r > 0 ? `${m} min e ${r}s` : `${m} minutos`;
  }

  return {
    startTime,
    pagesVisited,
    projectsViewed,
    postsViewed,
    technicalData,
    locationData,
    locationLoaded,
    init,
    trackPage,
    trackProject,
    trackPost,
    collectTechnicalData,
    collectLocationData,
    getTimeOnSite,
    getBehavioralData,
    formatTimeOnSite,
  };
});
