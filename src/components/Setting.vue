<template>
  <n-form
    ref="formRef"
    label-width="auto"
    label-placement="left"
    require-mark-placement="right-hanging"
    :style="{
      margin: '16px',
    }"
  >
    <n-form-item label="lux 程序路径">
      <n-flex :wrap="false" style="width: 100%">
        <n-input
          v-model:value="setting.luxPath"
          placeholder="lux 程序路径"
          readonly
        />
        <n-button-group>
          <n-button @click="handleSelectLuxPath">选择...</n-button>
          <n-button @click="handleDownloadLux">下载</n-button>
        </n-button-group>
      </n-flex>
    </n-form-item>
    <n-form-item label="ffmpeg 程序路径">
      <n-flex :wrap="false" style="width: 100%">
        <n-input
          v-model:value="setting.ffmpegPath"
          placeholder="ffmpeg 程序路径"
          readonly
        />
        <n-button-group>
          <n-button @click="handleSelectFFmpegPath">选择...</n-button>
          <n-button @click="handleDownloadFFmpeg">下载</n-button>
        </n-button-group>
      </n-flex>
    </n-form-item>
    <n-form-item label="视频文件夹">
      <n-flex :wrap="false" style="width: 100%">
        <n-input
          v-model:value="setting.outputDir"
          placeholder="请输入视频文件夹路径"
          readonly
        />
        <n-button-group>
          <n-button @click="handleSelectOutputDir">选择...</n-button>
          <n-button @click="handleOpenOutputDir">打开</n-button>
        </n-button-group>
      </n-flex>
    </n-form-item>
    <!-- <n-form-item label="优先分辨率">
      <n-flex :wrap="false" style="width: 100%">
        <n-radio-group v-model:value="setting.quality">
          <n-radio-button
            v-for="option in qualityOptions"
            :key="option.label"
            :label="option.label"
            :value="option.value"
          ></n-radio-button>
        </n-radio-group>
      </n-flex>
    </n-form-item>
    <n-form-item label="优先编码">
      <n-flex :wrap="false" style="width: 100%">
        <n-radio-group v-model:value="setting.codec">
          <n-radio-button
            v-for="option in codecOptions"
            :key="option.label"
            :label="option.label"
            :value="option.value"
          ></n-radio-button>
        </n-radio-group>
      </n-flex>
    </n-form-item> -->
    <n-form-item label="Cookie">
      <n-dynamic-input
        v-model:value="setting.cookies"
        preset="pair"
        key-placeholder="网址"
        value-placeholder="Cookie"
      />
    </n-form-item>
  </n-form>
</template>

<script setup lang="ts">
import {
  NForm,
  NFormItem,
  NInput,
  NButtonGroup,
  NButton,
  NFlex,
  NDynamicInput,
} from "naive-ui";
import { setting } from "../utils/store";

// const qualityOptions = [
//   { label: "4K", value: "4k" },
//   { label: "2K", value: "2k" },
//   { label: "1080P", value: "1080p" },
//   { label: "720P", value: "720p" },
//   { label: "480P", value: "480p" },
//   { label: "360P", value: "360p" },
// ];

// const codecOptions = [
//   { label: "H.264", value: "h264" },
//   { label: "H.265", value: "h265" },
// ];

function handleSelectLuxPath() {
  let path = utools.showOpenDialog({
    title: "选择 lux 程序路径",
    filters: [{ name: "lux", extensions: ["exe"] }],
    properties: ["openFile"],
  });
  if (path) {
    setting.luxPath = path[0];
  }
}

function handleDownloadLux() {
  utools.shellOpenExternal("https://github.com/iawia002/lux/releases");
}

function handleSelectFFmpegPath() {
  let path = utools.showOpenDialog({
    title: "选择 ffmpeg 程序路径",
    filters: [{ name: "ffmpeg", extensions: ["exe"] }],
    properties: ["openFile"],
  });
  if (path) {
    setting.ffmpegPath = path[0];
  }
}

function handleDownloadFFmpeg() {
  utools.shellOpenExternal("https://ffmpeg.org/download.html");
}

function handleSelectOutputDir() {
  let path = utools.showOpenDialog({
    title: "选择视频文件夹",
    properties: ["openDirectory"],
  });
  if (path) {
    setting.outputDir = path[0];
  }
}

function handleOpenOutputDir() {
  if (setting.outputDir) {
    utools.shellOpenPath(setting.outputDir);
  }
}
</script>
