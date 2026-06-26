import type { Post } from "@portfolio/types";

export function useAdminPosts() {
  const config = useRuntimeConfig();
  const auth = useAuthStore();

  function headers(): Record<string, string> {
    return auth.token ? { Authorization: `Bearer ${auth.token}` } : {};
  }

  function list(): Promise<Post[]> {
    return $fetch<Post[]>("/admin/posts", {
      baseURL: config.public.apiBase,
      headers: headers(),
    });
  }

  function get(id: string): Promise<Post> {
    return $fetch<Post>(`/admin/posts/${id}`, {
      baseURL: config.public.apiBase,
      headers: headers(),
    });
  }

  function create(body: Record<string, unknown>): Promise<Post> {
    return $fetch<Post>("/admin/posts", {
      method: "POST",
      baseURL: config.public.apiBase,
      headers: headers(),
      body,
    });
  }

  function update(id: string, body: Record<string, unknown>): Promise<Post> {
    return $fetch<Post>(`/admin/posts/${id}`, {
      method: "PATCH",
      baseURL: config.public.apiBase,
      headers: headers(),
      body,
    });
  }

  function remove(id: string): Promise<void> {
    return $fetch<void>(`/admin/posts/${id}`, {
      method: "DELETE",
      baseURL: config.public.apiBase,
      headers: headers(),
    });
  }

  return { list, get, create, update, remove };
}
