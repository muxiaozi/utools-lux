import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { cleanupUrl } from "./utils/util";

const app = createApp(App);
app.use(router);
app.mount("#app");

utools.onPluginEnter(async ({ code, type, payload }) => {
  console.log("onPluginEnter", code, type, payload);

  if (code == "download") {
    switch (type) {
      case "window": {
        let url = await utools.readCurrentBrowserUrl();
        router.push({
          name: "download",
          query: {
            url: cleanupUrl(url),
          },
        });
        break;
      }
      case "regex": {
        router.push({
          name: "download",
          query: {
            url: cleanupUrl(payload),
          },
        });
        break;
      }
    }
  } else {
    router.push({ name: "home" });
  }
});

utools.onPluginOut((processExit) => {
  console.log("onPluginOut, processExit:", processExit);
});
