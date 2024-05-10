<template>
  <div
    style="display: flex; flex-direction: column; height: 100vh; width: 100%"
  >
    <n-layout has-sider>
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="160"
        :collapsed="collapsed"
        show-trigger
        @collapse="collapsed = true"
        @expand="collapsed = false"
      >
        <n-menu
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
          mode="vertical"
          v-model:value="activeKey"
        />
      </n-layout-sider>
      <n-layout>
        <n-dialog-provider>
          <n-config-provider>
            <router-view></router-view>
          </n-config-provider>
        </n-dialog-provider>
      </n-layout>
    </n-layout>
  </div>
</template>

<script setup lang="ts">
import { h, Component, ref } from "vue";
import {
  NIcon,
  useMessage,
  MenuOption,
  NLayout,
  NLayoutSider,
  NMenu,
  NDialogProvider,
  NConfigProvider,
} from "naive-ui";
import { RouterLink, useRouter } from "vue-router";
import {
  HomeOutline as HomeIcon,
  FilmOutline as DownloadIcon,
  SettingsOutline as SettingIcon,
} from "@vicons/ionicons5";

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

let collapsed = ref(false);
let activeKey = ref("main");
const router = useRouter();

router.afterEach((to, from, failure) => {
  const routeName = to.name as string;
  activeKey.value = routeName;
});

const menuOptions: MenuOption[] = [
  {
    label: () => h(RouterLink, { to: "/" }, () => "主页"),
    key: "main",
    icon: renderIcon(HomeIcon),
  },
  {
    label: () => h(RouterLink, { to: "/download" }, () => "下载视频"),
    key: "download",
    icon: renderIcon(DownloadIcon),
  },
  {
    label: () => h(RouterLink, { to: "/setting" }, () => "设置"),
    key: "setting",
    icon: renderIcon(SettingIcon),
  },
];
</script>

<style scoped></style>
