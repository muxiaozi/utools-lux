<template>
  <n-page-header title="下载视频" class="header">
    <template #extra>
      <n-flex align="center">
        <n-switch
          :rubber-band="false"
          :value="usePlaylist"
          :loading="switchPlaylistPending"
          @update:value="switchPlaylist"
          :disabled="url === undefined"
        >
          <template #checked> 列表 </template>
          <template #unchecked> 单个 </template>
        </n-switch>
        <n-button
          @click="download"
          round
          size="small"
          :loading="downloadRunning"
          :disabled="data.length === 0 || checkedRowKeys.length === 0"
        >
          <template #icon>
            <n-icon :component="DownloadIcon" />
          </template>
          <template #default>{{ downloadButtonContent }}</template>
        </n-button>
      </n-flex>
    </template>
  </n-page-header>

  <n-data-table
    :columns="columns"
    :data="data"
    default-expand-all
    :bordered="false"
    :row-key="(row: RowData) => row.key"
    @update-checked-row-keys="updateCheckedRowKeys"
    :max-height="`calc(100vh - 142px)`"
  />
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, h, watch } from "vue";
import {
  NDataTable,
  DataTableColumns,
  NPageHeader,
  NFlex,
  NButton,
  NIcon,
  useLoadingBar,
  DataTableRowKey,
  NRadioGroup,
  NRadio,
  NSwitch,
} from "naive-ui";
import { DownloadSharp as DownloadIcon } from "@vicons/ionicons5";
import { InternalRowData } from "naive-ui/es/data-table/src/interface";
import { setting } from "../utils/store";

type RowData = {
  key: string;
  url: string;
  title: string;
  selected: boolean;
  selectedStream: string;
  playlistItemIndex: number;
  streams: { label: string; value: string }[];
};

type DownloadInfo = {
  url: string;
  playlistItemIndex: number;
  streamIndex: string;
};

const route = useRoute();
const query = route.query;
let url: string | undefined;
if (query["url"] != undefined) {
  url = decodeURIComponent(query["url"] as string);
}
const usePlaylist = ref(false);
const switchPlaylistPending = ref(false);
const loadingBar = useLoadingBar();
const checkedRowKeys = ref<DataTableRowKey[]>([]);
const downloadRunning = ref(false);
const downloadInfoMap: Map<string, DownloadInfo> = new Map();
const mainTitle = ref<string>();
const data = ref<RowData[]>([]);
const downloadButtonContent = ref("下载");
const columns: DataTableColumns<RowData> = [
  {
    type: "selection",
  },
  {
    type: "expand",
    renderExpand: renderQualitySelecor,
  },
  {
    title: "视频标题",
    key: "title",
  },
];
const videoInfoCache: {
  singleVideoInfo: RowData[] | undefined;
  playlistVideoInfo: RowData[] | undefined;
} = { singleVideoInfo: undefined, playlistVideoInfo: undefined };

console.log("download Url: ", url);
switchPlaylist(false);

watch(data, () => {
  checkedRowKeys.value = [];
});

function switchPlaylist(value: boolean) {
  if (value && videoInfoCache.playlistVideoInfo) {
    data.value = videoInfoCache.playlistVideoInfo;
    usePlaylist.value = value;
    return;
  } else if (!value && videoInfoCache.singleVideoInfo) {
    data.value = videoInfoCache.singleVideoInfo;
    usePlaylist.value = value;
    return;
  } else if (url) {
    switchPlaylistPending.value = true;
    loadingBar.start();
    fetchVideoInfo(url, value)
      .then((result) => {
        data.value = result;
        loadingBar.finish();
        usePlaylist.value = value;
        switchPlaylistPending.value = false;
      })
      .catch((e) => {
        console.error(e);
        loadingBar.error();
        switchPlaylistPending.value = false;
      });
  }
}

function updateCheckedRowKeys(
  keys: DataTableRowKey[],
  _rows: InternalRowData[],
  meta: {
    row: InternalRowData | undefined;
    action: "check" | "uncheck" | "checkAll" | "uncheckAll";
  }
) {
  checkedRowKeys.value = keys;
  if (meta.action === "check") {
    (meta.row as RowData).selected = true;
  } else if (meta.action === "uncheck") {
    (meta.row as RowData).selected = false;
  } else if (meta.action === "checkAll") {
    for (let row of data.value) {
      (row as RowData).selected = true;
    }
  } else if (meta.action === "uncheckAll") {
    for (let row of data.value) {
      (row as RowData).selected = false;
    }
  }
}

function getCookie(url: string): string {
  let cookies = setting.cookies;
  for (let cookie of cookies) {
    let regex = /https?:\/\/(.*?)(\/|$)/;
    let match = regex.exec(url);
    if (match) {
      if (cookie.key.trim() === match[1]) {
        return cookie.value;
      }
    }
  }
  return "";
}

function renderQualitySelecor(rowData: RowData) {
  return h(
    NRadioGroup,
    {
      value: rowData.selectedStream,
      name: rowData.key,
      disabled: !rowData.selected,
      "onUpdate:value": (value: string) => {
        rowData.selectedStream = value;
        downloadInfoMap.set(rowData.key, {
          url: rowData.url,
          streamIndex: value,
          playlistItemIndex: rowData.playlistItemIndex,
        });
      },
    },
    {
      default: () => {
        return h(NFlex, null, {
          default: () => {
            return rowData.streams.map((stream) => {
              return h(NRadio, {
                key: stream.value,
                label: stream.label,
                value: stream.value,
              });
            });
          },
        });
      },
    }
  );
}

async function download() {
  downloadRunning.value = true;
  let downloadIndex = 1;

  if (usePlaylist.value) {
    for (let key of checkedRowKeys.value) {
      downloadButtonContent.value = `${downloadIndex} / ${checkedRowKeys.value.length}`;

      let downloadInfo = downloadInfoMap.get(key.toString());
      console.log("download key: ", key.toString(), downloadInfo);
      if (downloadInfo) {
        try {
          await downloadVideo(
            downloadInfo.url,
            [downloadInfo.streamIndex],
            downloadInfo.playlistItemIndex.toString()
          );
        } catch (e) {
          console.error(e);
        }
      }

      downloadIndex++;
    }
  } else {
    for (let key of checkedRowKeys.value) {
      downloadButtonContent.value = `${downloadIndex} / ${checkedRowKeys.value.length}`;

      let downloadInfo = downloadInfoMap.get(key.toString());
      console.log("download key: ", key.toString(), downloadInfo);
      if (downloadInfo) {
        try {
          await downloadVideo(downloadInfo.url, [downloadInfo.streamIndex]);
        } catch (e) {
          console.error(e);
        }
      }

      downloadIndex++;
    }
  }

  downloadButtonContent.value = "下载";
  downloadRunning.value = false;

  utools.showNotification(`下载完成 ${checkedRowKeys.value.length} 个视频`);
}

async function fetchVideoInfo(
  url: string,
  playlist: boolean
): Promise<RowData[]> {
  let command = [setting.luxPath, "-i", "-j"];
  if (playlist) {
    command.push("-p");
  }
  let cookie = getCookie(url);
  if (cookie) {
    command.push("-c", `"${cookie}"`);
  }
  let rawResult = await runCommand([...command, url]);
  let jsonResult = JSON.parse(rawResult);
  if (jsonResult.length === 0) {
    return [];
  }

  if (!playlist) {
    mainTitle.value = jsonResult[0]["title"];
  }

  let result: RowData[] = [];
  let playlistBeginIndex = 1;
  for (let videoInfo of jsonResult) {
    let jsonStreams = [];
    let streams = videoInfo["streams"];

    for (let streamKey in streams) {
      jsonStreams.push({
        value: streamKey,
        label: streams[streamKey]["quality"],
      });
    }

    let title = videoInfo["title"];
    if (playlist && mainTitle.value) {
      title = title.replace(mainTitle.value, "");
    }

    let item: RowData = {
      key: videoInfo["title"],
      url: videoInfo["url"],
      title: title,
      selected: false,
      playlistItemIndex: playlistBeginIndex,
      selectedStream: jsonStreams.length > 0 ? jsonStreams[0].value : "",
      streams: jsonStreams,
    };

    downloadInfoMap.set(item.key, {
      url: item.url,
      streamIndex: item.selectedStream,
      playlistItemIndex: item.playlistItemIndex,
    });

    result.push(item);

    playlistBeginIndex++;
  }

  if (!playlist) {
    videoInfoCache.singleVideoInfo = result;
  } else {
    videoInfoCache.playlistVideoInfo = result;
  }

  return result;
}

async function downloadVideo(
  url: string,
  streams: string[],
  playlistItems?: string
): Promise<string> {
  let command = [setting.luxPath, "-o", setting.outputDir, "-f", ...streams];
  let cookie = getCookie(url);
  if (cookie) {
    command.push("-c", `"${cookie}"`);
  }
  if (playlistItems) {
    command.push("-p");
    command.push("--items", playlistItems);
  }
  console.log("download command: ", command);
  let result = await runCommand([...command, url]);
  return result;
}
</script>

<style scoped lang="css">
.header {
  margin: 10px 10px;
  height: 28px;
}
</style>
