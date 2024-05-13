<template>
  <n-flex style="height: 100vh" :vertical="true" justify="center">
    <n-flex :wrap="false" style="margin: 0px 64px">
      <n-input placeholder="请输入视频链接" v-model:value="url"></n-input>
      <n-button @click="handleDownload">下载</n-button>
    </n-flex>
  </n-flex>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { NFlex, NInput, NButton } from "naive-ui";

const url = ref("");
const router = useRouter();

function handleDownload() {
  router.push(`/download?url=${encodeURIComponent(url.value)}`);
}
</script>
