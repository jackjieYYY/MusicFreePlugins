import { createMusicPlugin, MusicSourceEnum } from "../musicPluginFactory";

const plugin = createMusicPlugin({
  currentSource: MusicSourceEnum.TENCENT,
  platformName: "腾讯",
  version: "0.1.0",
  srcUrl:
    "https://github.com/jackjieYYY/MusicFreePlugins/blob/master/dist/tencent/index.js",
});

export const { search, getMediaSource, getLyric } = plugin;

export default plugin.pluginConfig;
