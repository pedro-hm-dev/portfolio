<script setup lang="ts">
const { t, locale, setLocale } = useI18n();
const localePath = useLocalePath();
const colorMode = useColorMode();

const otherLocale = computed(() => (locale.value === "pt" ? "en" : "pt"));
</script>

<template>
  <div>
    <header class="flex items-center justify-between border-b border-default px-6 py-4">
      <NuxtLink :to="localePath('/')" class="text-lg font-bold">Pedro Maciel</NuxtLink>
      <nav class="flex items-center gap-3">
        <NuxtLink
          :to="localePath('/projects')"
          class="relative text-sm text-muted transition-colors hover:text-default after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-200 hover:after:w-full"
          active-class="text-default after:w-full"
        >
          {{ t("nav.projects") }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/blog')"
          class="relative text-sm text-muted transition-colors hover:text-default after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-200 hover:after:w-full"
          active-class="text-default after:w-full"
        >
          {{ t("nav.blog") }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/sobre')"
          class="relative text-sm text-muted transition-colors hover:text-default after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-200 hover:after:w-full"
          active-class="text-default after:w-full"
        >
          {{ t("nav.about") }}
        </NuxtLink>
        <UButton variant="ghost" size="sm" @click="setLocale(otherLocale)">
          {{ otherLocale.toUpperCase() }}
        </UButton>
        <UButton
          variant="ghost"
          size="sm"
          :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
          @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
        />
      </nav>
    </header>

    <main class="mx-auto max-w-5xl px-6 py-12">
      <slot />
    </main>

    <!-- Tour floating button + overlay (client-only to avoid SSR issues) -->
    <ClientOnly>
      <TourOverlay />
    </ClientOnly>
  </div>
</template>
