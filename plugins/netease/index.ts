import { createMusicPlugin, MusicSourceEnum } from "../musicPluginFactory";

const plugin = createMusicPlugin({
  currentSource: MusicSourceEnum.NETEASE,
  platformName: "网易云",
  version: "0.1.0",
  srcUrl:
    "https://raw.githubusercontent.com/jackjieYYY/MusicFreePlugins/refs/heads/master/dist/gdstudio/index.js",
});

export const { search, getMediaSource, getLyric } = plugin;
export default plugin.pluginConfig;
