import { createMusicPlugin, MusicSourceEnum } from "../musicPluginFactory";

const plugin = createMusicPlugin({
  currentSource: MusicSourceEnum.NETEASE,
  platformName: "网易云",
  version: "0.1.0",
  srcUrl:
    "https://github.com/jackjieYYY/MusicFreePlugins/blob/master/dist/netease/index.js",
});

export const { search, getMediaSource, getLyric } = plugin;
export default plugin.pluginConfig;
