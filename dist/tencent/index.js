var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// plugins/tencent/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default,
  getLyric: () => getLyric,
  getMediaSource: () => getMediaSource,
  search: () => search
});
module.exports = __toCommonJS(index_exports);

// plugins/musicPluginFactory.ts
var import_axios = __toESM(require("axios"));
var pageSize = 20;
var baseURL = "https://music-api.gdstudio.xyz/api.php";
var mediaType = "music";
function createMusicPlugin(config) {
  const { currentSource, platformName, author = "欧皇大佬", version = "0.1.0", srcUrl } = config;
  function formatMusicItem(item) {
    return {
      id: item.id,
      title: item.name,
      artist: Array.isArray(item.artist) ? item.artist.join(", ") : typeof item.artist === "string" ? item.artist : "",
      album: item.album,
      artwork: item.pic_id ? `${baseURL}?types=pic&source=${item.source}&id=${item.pic_id}&size=500` : void 0,
      source: item.source,
      picId: item.pic_id,
      lyricId: item.lyric_id
    };
  }
  async function searchMusicWithSource(query, page, source = "netease") {
    try {
      const response = await import_axios.default.get(baseURL, {
        params: {
          types: "search",
          source,
          name: query,
          count: pageSize,
          pages: page
        },
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        timeout: 1e4
        // 10秒超时
      });
      const data = response.data;
      if (!Array.isArray(data)) {
        return [];
      }
      return data.map(formatMusicItem);
    } catch (error) {
      console.error(`搜索失败 (${source}):`, error.message);
      return [];
    }
  }
  async function searchMusic(query, page) {
    const results = await searchMusicWithSource(query, page, currentSource);
    return {
      isEnd: results.length < pageSize,
      data: results
    };
  }
  async function search2(query, page, type) {
    if (type === mediaType) {
      return await searchMusic(query, page);
    }
    return {
      isEnd: true,
      data: []
    };
  }
  async function getMediaSource2(musicItem, quality) {
    try {
      let br = "740" /* HIGH */;
      switch (quality) {
        case "low":
          br = "192" /* LOW */;
          break;
        case "standard":
          br = "320" /* STANDARD */;
          break;
        case "high":
          br = "740" /* HIGH */;
          break;
        case "super":
          br = "999" /* SUPER */;
          break;
        default:
          br = "740" /* HIGH */;
      }
      const response = await import_axios.default.get(baseURL, {
        params: {
          types: "url",
          source: musicItem.source,
          id: musicItem.id,
          br
        },
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        timeout: 1e4
        // 10秒超时
      });
      const data = response.data;
      if (data && data.url) {
        return {
          url: data.url,
          quality: data.br || br,
          size: data.size
        };
      }
      if (br !== "192" /* LOW */) {
        console.log(`音质 ${br} 获取失败，尝试降低音质重试`);
        const fallbackBr = br === "999" /* SUPER */ ? "740" /* HIGH */ : br === "740" /* HIGH */ ? "320" /* STANDARD */ : "192" /* LOW */;
        const fallbackResponse = await import_axios.default.get(baseURL, {
          params: {
            types: "url",
            source: musicItem.source || "netease",
            id: musicItem.id,
            br: fallbackBr
          },
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
          },
          timeout: 1e4
        });
        const fallbackData = fallbackResponse.data;
        if (fallbackData && fallbackData.url) {
          return {
            url: fallbackData.url,
            quality: fallbackData.br || fallbackBr,
            size: fallbackData.size
          };
        }
      }
      return {};
    } catch (error) {
      console.error("获取音频链接失败:", error.message);
      return {};
    }
  }
  async function getLyric2(musicItem) {
    try {
      const response = await import_axios.default.get(baseURL, {
        params: {
          types: "lyric",
          source: musicItem.source,
          id: musicItem.lyricId || musicItem.id
        },
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        timeout: 1e4
        // 10秒超时
      });
      const data = response.data;
      return {
        rawLrc: data.lyric || "",
        translation: data.tlyric || ""
      };
    } catch (error) {
      console.error("获取歌词失败:", error.message);
      return {
        rawLrc: ""
      };
    }
  }
  return {
    search: search2,
    getMediaSource: getMediaSource2,
    getLyric: getLyric2,
    pluginConfig: {
      platform: platformName,
      author,
      version,
      supportedSearchType: ["music"],
      primaryKey: ["id", "source"],
      supportedQuality: ["low", "standard", "high", "super"],
      srcUrl: srcUrl || "https://raw.githubusercontent.com/jackjieYYY/MusicFreePlugins/refs/heads/master/dist/gdstudio/index.js",
      cacheControl: "no-cache",
      search: search2,
      getMediaSource: getMediaSource2,
      getLyric: getLyric2
    }
  };
}

// plugins/tencent/index.ts
var plugin = createMusicPlugin({
  currentSource: "tencent" /* TENCENT */,
  platformName: "腾讯",
  version: "0.1.0",
  srcUrl: "https://raw.githubusercontent.com/jackjieYYY/MusicFreePlugins/refs/heads/master/dist/gdstudio/index.js"
});
var { search, getMediaSource, getLyric } = plugin;
var index_default = plugin.pluginConfig;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getLyric,
  getMediaSource,
  search
});
