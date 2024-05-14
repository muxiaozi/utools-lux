import { reactive, watch } from "vue";
import * as _ from "lodash";
import { where } from "./util";

type Setting = {
  luxPath: string;
  ffmpegPath: string;
  outputDir: string;
  quality: string;
  codec: string;
  cookies: {
    key: string;
    value: string;
  }[];
};

const defaultSetting: Setting = {
  luxPath: "",
  ffmpegPath: "",
  outputDir: "",
  quality: "1080p",
  codec: "h265",
  cookies: [],
};

const setting = reactive<Setting>(defaultSetting);

function updateSetting(setting: Setting) {
  utools.dbStorage.setItem(settingKey, _.cloneDeep(setting));
}

watch(setting, _.debounce(updateSetting, 2000));

const settingKey = utools.getNativeId() + "/setting";
let _setting = utools.dbStorage.getItem(settingKey);
if (!_setting) {
  Object.assign(setting, { outputDir: utools.getPath("videos") });
  utools.dbStorage.setItem(settingKey, _.cloneDeep(setting));
  // 寻找系统中的 lux 和 ffmpeg
  try {
    setting.luxPath = await where("lux");
  } catch (ignored) {}
  try {
    setting.ffmpegPath = await where("ffmpeg");
  } catch (ignored) {}
} else {
  Object.assign(setting, _setting);
}

export { setting };
