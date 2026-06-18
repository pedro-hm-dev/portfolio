import type { Project, Post } from "@portfolio/types";

/**
 * Dynamic sitemap source for content routes. Published projects/posts are
 * fetched from the API; `_i18nTransform` lets @nuxtjs/sitemap expand each
 * entry into its pt/en variants with hreflang alternates.
 */
export default defineSitemapEventHandler(async () => {
  const base = useRuntimeConfig().public.apiBase;

  const [projects, posts] = await Promise.all([
    $fetch<Project[]>("/projects", { baseURL: base }).catch(() => [] as Project[]),
    $fetch<Post[]>("/posts", { baseURL: base }).catch(() => [] as Post[]),
  ]);

  return [
    ...projects.map((p) => ({
      loc: `/projects/${p.slug}`,
      lastmod: p.updatedAt,
      _i18nTransform: true,
    })),
    ...posts.map((p) => ({
      loc: `/blog/${p.slug}`,
      lastmod: p.updatedAt,
      _i18nTransform: true,
    })),
  ];
});
