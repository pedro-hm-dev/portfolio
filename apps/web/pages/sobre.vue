<script setup lang="ts">
const { t } = useI18n();

useSeoMeta({
  title: () => `${t("about.title")} — Pedro Maciel`,
  description: () => t("about.subtitle"),
});

const config = useRuntimeConfig();
const toast = useToast();
const sending = ref(false);
const sent = ref(false);

const form = reactive({ name: "", email: "", message: "" });

async function handleSubmit() {
  sending.value = true;
  try {
    await $fetch("/contact", {
      method: "POST",
      baseURL: config.public.apiBase,
      body: form,
    });
    sent.value = true;
    toast.add({ title: t("about.contact.success"), color: "success" });
    form.name = "";
    form.email = "";
    form.message = "";
  } catch {
    toast.add({ title: t("about.contact.error"), color: "error" });
  } finally {
    sending.value = false;
  }
}

const skills = [
  { category: "Front-end", items: ["Nuxt 4", "Vue 3", "TypeScript", "Tailwind CSS", "Nuxt UI"] },
  { category: "Back-end", items: ["NestJS", "Node.js", "MongoDB", "Mongoose", "JWT Auth"] },
  { category: "DevOps / Infra", items: ["Docker", "GitHub Actions", "Vercel", "Render"] },
  { category: "Outros", items: ["Playwright", "Vitest", "Swagger", "Anthropic API", "LGPD"] },
];
</script>

<template>
  <div class="flex flex-col gap-16">
    <!-- Hero -->
    <section class="flex flex-col gap-4">
      <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">{{ t("about.title") }}</h1>
      <p class="max-w-2xl text-lg text-muted">{{ t("about.subtitle") }}</p>
    </section>

    <!-- Bio -->
    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">{{ t("about.bioTitle") }}</h2>
      <div class="prose dark:prose-invert max-w-none text-muted">
        <p>{{ t("about.bio") }}</p>
      </div>
    </section>

    <!-- Skills -->
    <section class="flex flex-col gap-6">
      <h2 class="text-xl font-semibold">{{ t("about.skillsTitle") }}</h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <div v-for="group in skills" :key="group.category" class="rounded-xl border border-default p-4">
          <p class="mb-2 text-sm font-medium text-muted">{{ group.category }}</p>
          <div class="flex flex-wrap gap-1.5">
            <UBadge v-for="s in group.items" :key="s" variant="outline" size="sm">{{ s }}</UBadge>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact form -->
    <section class="flex flex-col gap-6" id="contato">
      <div>
        <h2 class="text-xl font-semibold">{{ t("about.contact.title") }}</h2>
        <p class="text-sm text-muted mt-1">{{ t("about.contact.subtitle") }}</p>
      </div>

      <div v-if="sent" class="rounded-xl border border-success/30 bg-success/10 p-6 text-center">
        <UIcon name="i-lucide-check-circle" class="size-8 text-success mx-auto mb-2" />
        <p class="font-medium">{{ t("about.contact.success") }}</p>
      </div>

      <form v-else class="flex flex-col gap-4 max-w-lg" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-2 gap-4">
          <UFormField :label="t('about.contact.name')">
            <UInput v-model="form.name" required />
          </UFormField>
          <UFormField :label="t('about.contact.email')">
            <UInput v-model="form.email" type="email" required />
          </UFormField>
        </div>
        <UFormField :label="t('about.contact.message')">
          <UTextarea v-model="form.message" :rows="5" required />
        </UFormField>
        <UButton type="submit" :loading="sending">{{ t("about.contact.send") }}</UButton>
      </form>
    </section>
  </div>
</template>
