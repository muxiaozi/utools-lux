<template>
  <n-page-header title="下载视频" class="header">
    <template #extra>
      <n-space>
        <n-button @click="download" :round="true" size="small">
          <template #icon>
            <n-icon :component="DownloadIcon" />
          </template>
          <template #default>下载</template>
        </n-button>
      </n-space>
    </template>
  </n-page-header>

  <n-data-table
    :columns="columns"
    :data="data"
    default-expand-all
    :row-key="(row: RowData) => row.id"
    :max-height="`calc(100vh - 142px)`"
  />
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref } from "vue";
import {
  NDataTable,
  DataTableColumns,
  NPageHeader,
  NSpace,
  NButton,
  NIcon,
  useLoadingBar,
} from "naive-ui";
import { DownloadSharp as DownloadIcon } from "@vicons/ionicons5";

const route = useRoute();
let query = route.query;
let url = decodeURIComponent(query["url"] as string);
const loadingBar = useLoadingBar();

loadingBar.start();
fetchVideoInfo(url, true)
  .then((result) => {
    data.value = result;
    loadingBar.finish();
  })
  .catch((e) => {
    console.error(e.message);
    loadingBar.error();
  });

type RowData = {
  id: string;
  title: string;
  streamIndex?: string;
  children?: RowData[];
};

const data = ref<RowData[]>();

const columns: DataTableColumns<RowData> = [
  {
    type: "selection",
  },
  {
    title: "视频标题",
    key: "title",
  },
];

function download() {
  downloadVideo("https://www.bilibili.com/video/av21877586", ["16-12"])
    .then((result) => {
      console.log(result);
      loadingBar.finish();
    })
    .catch((e) => {
      console.error(e.message);
      loadingBar.error();
    });
}

async function fetchVideoInfo(
  url: string,
  playlist: boolean
): Promise<RowData[]> {
  let command = [
    "C:/Users/huhongwei/Downloads/lux_0.24.1_Windows_x86_64/lux.exe",
    "-i",
    "-j",
  ];
  if (playlist) {
    command.push("-p");
  }
  let rawResult = await runCommand([...command, url]);
  let jsonResult = JSON.parse(rawResult);
  if (jsonResult.length === 0) {
    return [];
  }

  let result: RowData[] = [];
  for (let videoInfo of jsonResult) {
    let jsonStreams: RowData[] = [];
    let streams = videoInfo["streams"];
    for (let streamKey in streams) {
      let stream = streams[streamKey];
      let jsonStream: RowData = {
        id: videoInfo["title"] + streamKey,
        streamIndex: streamKey,
        title: stream["quality"],
      };
      jsonStreams.push(jsonStream);
    }

    let item: RowData = {
      id: videoInfo["title"],
      title: videoInfo["title"],
      children: jsonStreams,
    };

    result.push(item);
  }

  return result;
}

async function downloadVideo(url: string, streams: string[]): Promise<string> {
  let command = [
    "C:/Users/huhongwei/Downloads/lux_0.24.1_Windows_x86_64/lux.exe",
    "-o",
    "D:/",
    "-f",
    ...streams,
    url,
  ];
  let result = await runCommand(command);
  console.log(result);
  return result;
}
</script>

<style scoped lang="css">
.header {
  margin: 10px 10px;
  height: 28px;
}
</style>
