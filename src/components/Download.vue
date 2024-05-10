<template>
  <h1>{{ content }}</h1>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

import { useRouter, useRoute } from "vue-router";

const route = useRoute();
let query = route.query;
let content = decodeURIComponent(query["url"] as string);
</script>
