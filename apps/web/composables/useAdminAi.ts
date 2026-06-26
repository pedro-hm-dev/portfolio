import type {
  TranslateRequest,
  TranslateResponse,
  MetaDescriptionRequest,
  MetaDescriptionResponse,
} from "@portfolio/types";

export function useAdminAi() {
  const config = useRuntimeConfig();
  const auth = useAuthStore();

  function headers(): Record<string, string> {
    return auth.token ? { Authorization: `Bearer ${auth.token}` } : {};
  }

  function translate(body: TranslateRequest): Promise<TranslateResponse> {
    return $fetch<TranslateResponse>("/admin/ai/translate", {
      method: "POST",
      baseURL: config.public.apiBase,
      headers: headers(),
      body,
    });
  }

  function generateMeta(body: MetaDescriptionRequest): Promise<MetaDescriptionResponse> {
    return $fetch<MetaDescriptionResponse>("/admin/ai/meta-description", {
      method: "POST",
      baseURL: config.public.apiBase,
      headers: headers(),
      body,
    });
  }

  return { translate, generateMeta };
}
