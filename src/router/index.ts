import { createRouter, createMemoryHistory } from "vue-router";

import Home from "../components/HelloWorld.vue";
import Download from "../components/Download.vue";
import Setting from "../components/Setting.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/download", name: "download", component: Download },
  { path: "/setting", name: "setting", component: Setting },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
