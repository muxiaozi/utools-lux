import { reactive, watch } from "vue";
import * as _ from "lodash";

type Setting = {
  luxPath: string;
  outputDir: string;
  quality: string;
  codec: string;
  cookies: {
    key: string;
    value: string;
  }[];
};

const defaultSetting: Setting = {
  luxPath: "lux.exe",
  outputDir: "",
  quality: "1080p",
  codec: "h265",
  cookies: [],
};

const setting = reactive<Setting>(defaultSetting);

const settingKey = utools.getNativeId() + "/setting";
let _setting = utools.dbStorage.getItem(settingKey);
if (!_setting) {
  Object.assign(setting, { outputDir: utools.getPath("videos") });
  utools.dbStorage.setItem(settingKey, _.cloneDeep(setting));
} else {
  Object.assign(setting, _setting);
}

function updateSetting(setting: Setting) {
  utools.dbStorage.setItem(settingKey, _.cloneDeep(setting));
}

watch(setting, _.debounce(updateSetting, 2000));

export { setting };
