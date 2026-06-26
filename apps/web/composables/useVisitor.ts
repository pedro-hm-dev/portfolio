import type { CreateVisitorRequest, PublicVisitor } from "@portfolio/types";

export function useVisitor() {
  const config = useRuntimeConfig();

  function submit(body: CreateVisitorRequest) {
    return $fetch("/visitor", {
      method: "POST",
      baseURL: config.public.apiBase,
      body,
    });
  }

  function listPublic(): Promise<PublicVisitor[]> {
    return $fetch<PublicVisitor[]>("/visitor/public", {
      baseURL: config.public.apiBase,
    });
  }

  return { submit, listPublic };
}
