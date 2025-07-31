import { createMusicPlugin, MusicSourceEnum } from "../musicPluginFactory";

const plugin = createMusicPlugin({
  currentSource: MusicSourceEnum.TENCENT,
  platformName: "腾讯",
  version: "0.1.0",
  srcUrl:
    "https://raw.githubusercontent.com/jackjieYYY/MusicFreePlugins/refs/heads/master/dist/gdstudio/index.js",
});

export const { search, getMediaSource, getLyric } = plugin;

export default plugin.pluginConfig;
