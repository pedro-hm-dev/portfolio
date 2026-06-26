import type { Project } from "@portfolio/types";

export function useAdminProjects() {
  const config = useRuntimeConfig();
  const auth = useAuthStore();

  function headers(): Record<string, string> {
    return auth.token ? { Authorization: `Bearer ${auth.token}` } : {};
  }

  function list(): Promise<Project[]> {
    return $fetch<Project[]>("/admin/projects", {
      baseURL: config.public.apiBase,
      headers: headers(),
    });
  }

  function get(id: string): Promise<Project> {
    return $fetch<Project>(`/admin/projects/${id}`, {
      baseURL: config.public.apiBase,
      headers: headers(),
    });
  }

  function create(body: Record<string, unknown>): Promise<Project> {
    return $fetch<Project>("/admin/projects", {
      method: "POST",
      baseURL: config.public.apiBase,
      headers: headers(),
      body,
    });
  }

  function update(id: string, body: Record<string, unknown>): Promise<Project> {
    return $fetch<Project>(`/admin/projects/${id}`, {
      method: "PATCH",
      baseURL: config.public.apiBase,
      headers: headers(),
      body,
    });
  }

  function remove(id: string): Promise<void> {
    return $fetch<void>(`/admin/projects/${id}`, {
      method: "DELETE",
      baseURL: config.public.apiBase,
      headers: headers(),
    });
  }

  return { list, get, create, update, remove };
}
