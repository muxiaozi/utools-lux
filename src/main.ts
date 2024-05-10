import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);
app.use(router);
app.mount("#app");

utools.onPluginEnter(async ({ code, type, payload }) => {
  console.log("onPluginEnter", code, type, payload);
  if (code == "download") {
    switch (type) {
      case "window": {
        let url = await utools.readCurrentBrowserUrl();
        router.push("/download?url=" + encodeURIComponent(url));
        break;
      }
      case "regex": {
        router.push("/download?url=" + encodeURIComponent(payload));
        break;
      }
    }
  } else {
    router.push("/");
  }
});
