import type { Project } from "@portfolio/types";

/** Public list of published projects (featured first). */
export function useProjectsList() {
  const config = useRuntimeConfig();
  return useFetch<Project[]>("/projects", {
    baseURL: config.public.apiBase,
    default: () => [] as Project[],
  });
}

/** Public detail of a single published project by slug. */
export function useProject(slug: MaybeRefOrGetter<string>) {
  const config = useRuntimeConfig();
  return useFetch<Project>(() => `/projects/${toValue(slug)}`, {
    baseURL: config.public.apiBase,
  });
}
