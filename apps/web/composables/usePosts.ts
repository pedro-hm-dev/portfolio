import type { Post } from "@portfolio/types";

/** Public list of published posts (newest first). */
export function usePostsList() {
  const config = useRuntimeConfig();
  return useFetch<Post[]>("/posts", {
    baseURL: config.public.apiBase,
    default: () => [] as Post[],
  });
}

/** Public detail of a single published post by slug. */
export function usePost(slug: MaybeRefOrGetter<string>) {
  const config = useRuntimeConfig();
  return useFetch<Post>(() => `/posts/${toValue(slug)}`, {
    baseURL: config.public.apiBase,
  });
}
