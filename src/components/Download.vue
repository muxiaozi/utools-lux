<template>
  <n-page-header title="下载视频" class="header">
    <template #extra>
      <n-flex align="center">
        <n-switch
          :rubber-band="false"
          :value="usePlaylist"
          :loading="switchPlaylistPending"
          @update:value="switchPlaylist"
        >
          <template #checked> 列表 </template>
          <template #unchecked> 单个 </template>
        </n-switch>
        <n-button @click="download" size="small">
          <template #icon>
            <n-icon :component="DownloadIcon" />
          </template>
          <template #default>下载</template>
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
import { ref, h } from "vue";
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

const route = useRoute();
let query = route.query;
const url = decodeURIComponent(query["url"] as string);
const usePlaylist = ref(false);
const switchPlaylistPending = ref(false);

const loadingBar = useLoadingBar();
const checkedRowKeys = ref<DataTableRowKey[]>([]);

loadingBar.start();
fetchVideoInfo(url, false)
  .then((result) => {
    data.value = result;
    loadingBar.finish();
  })
  .catch((e) => {
    console.error(e.message);
    loadingBar.error();
  });

type RowData = {
  key: string;
  url: string;
  title: string;
  selected: boolean;
  selectedStream: string;
  streams: { label: string; value: string }[];
};

type DownloadInfo = {
  url: string;
  streamIndex: string;
};

const downloadInfoMap: Map<string, DownloadInfo> = new Map();
const data = ref<RowData[]>([]);

let videoInfoCache: {
  singleVideoInfo: RowData[] | undefined;
  playlistVideoInfo: RowData[] | undefined;
} = { singleVideoInfo: undefined, playlistVideoInfo: undefined };

function switchPlaylist(value: boolean) {
  if (value && videoInfoCache.playlistVideoInfo) {
    data.value = videoInfoCache.playlistVideoInfo;
    usePlaylist.value = value;
    return;
  } else if (!value && videoInfoCache.singleVideoInfo) {
    data.value = videoInfoCache.singleVideoInfo;
    usePlaylist.value = value;
    return;
  } else {
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
        console.error(e.message);
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

const mainTitle = ref<string>();

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

function download() {
  for (let key of checkedRowKeys.value) {
    let downloadInfo = downloadInfoMap.get(key.toString());
    if (downloadInfo) {
      console.log(downloadInfo);
    }
  }
  // downloadVideo("https://www.bilibili.com/video/av21877586", ["16-12"])
  //   .then((result) => {
  //     console.log(result);
  //     loadingBar.finish();
  //   })
  //   .catch((e) => {
  //     console.error(e.message);
  //     loadingBar.error();
  //   });
}

async function fetchVideoInfo(
  url: string,
  playlist: boolean
): Promise<RowData[]> {
  let command = ["lux.exe", "-i", "-j"];
  if (playlist) {
    command.push("-p");
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
      selectedStream: jsonStreams[0].value, // 默认选择第一个
      streams: jsonStreams,
    };

    downloadInfoMap.set(item.key, {
      url: item.url,
      streamIndex: item.selectedStream,
    });

    result.push(item);
  }

  if (!playlist) {
    videoInfoCache.singleVideoInfo = result;
  } else {
    videoInfoCache.playlistVideoInfo = result;
  }

  return result;
}

async function downloadVideo(url: string, streams: string[]): Promise<string> {
  let command = ["lux.exe", "-o", "D:/", "-f", ...streams, url];
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
