import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

createApp(App).mount("#app");

enum MediaType {
  Video,
  Audio,
}

type Stream = {
  id: string;
  quality: string;
  ext: string;
  size: number;
  need_mux: boolean; // 是否需要混流
};

type MediaInfo = {
  url: string;
  site: string;
  title: string;
  type: MediaType;
  streams: Stream[];
};

async function getUrlInfo(url: string): Promise<MediaInfo> {
  console.log("downloadUrl", url);
  let result = await window.runCommand([
    "C:/Users/huhongwei/Downloads/lux_0.24.1_Windows_x86_64/lux.exe",
    "-j",
    "-i",
    '"' + url + '"',
  ]);
  return JSON.parse(result);
}

utools.onPluginEnter(async ({ code, type, payload }) => {
  console.log("onPluginEnter", code, type, payload);
  if (code == "download") {
    // 从窗口下载
    if (type == "window") {
      let url = await utools.readCurrentBrowserUrl();
      if (payload.title.includes("_哔哩哔哩_bilibili")) {
        let info = await getUrlInfo(url);
        console.log(info.streams);
      }
    } else if (type == "regex") {
      getUrlInfo(payload);
    }
  }
});
