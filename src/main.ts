import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import VConsole from "vconsole";

const app = createApp(App);
app.use(router);
app.mount("#app");

const vconsole = new VConsole();
vconsole.hide();

utools.onPluginEnter(async ({ code, type, payload }) => {
  console.log("onPluginEnter", code, type, payload);

  if (code == "download") {
    switch (type) {
      case "window": {
        let url = await utools.readCurrentBrowserUrl();
        router.push({
          name: "download",
          query: {
            url: encodeURIComponent(url),
          },
        });
        break;
      }
      case "regex": {
        router.push({
          name: "download",
          query: {
            url: encodeURIComponent(payload),
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
