<script setup lang="ts">
const localeHead = useLocaleHead({ dir: true, lang: true, seo: true });
useHead(localeHead);
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
