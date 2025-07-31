import axios from "axios";

const pageSize = 20;
const baseURL = "https://music-api.gdstudio.xyz/api.php";

// 支持的音乐源列表
const musicSources = [
  "netease", // 网易云音乐（默认）
  "tencent", // 腾讯音乐
  "kugou", // 酷狗音乐
  "kuwo", // 酷我音乐
  "migu", // 咪咕音乐
  "spotify", // Spotify
  "apple", // Apple Music
  "deezer", // Deezer
  "ytmusic", // YouTube Music
];

function formatMusicItem(item) {
  return {
    id: item.id,
    title: item.name,
    artist: Array.isArray(item.artist)
      ? item.artist.join(", ")
      : typeof item.artist === "string"
      ? item.artist
      : "",
    album: item.album,
    artwork: item.pic_id
      ? `${baseURL}?types=pic&source=${item.source}&id=${item.pic_id}&size=500`
      : undefined,
    source: item.source,
    picId: item.pic_id,
    lyricId: item.lyric_id,
  };
}

async function searchMusicWithSource(query, page, source = "netease") {
  try {
    const response = await axios.get(baseURL, {
      params: {
        types: "search",
        source: source,
        name: query,
        count: pageSize,
        pages: page,
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 10000, // 10秒超时
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
  // 优先使用网易云音乐，如果失败则尝试其他音乐源
  let results = await searchMusicWithSource(query, page, "netease");

  // 如果网易云没有结果，尝试其他音乐源
  if (results.length === 0 && page === 1) {
    for (const source of ["tencent", "kugou", "kuwo"]) {
      results = await searchMusicWithSource(query, page, source);
      if (results.length > 0) {
        break;
      }
    }
  }

  return {
    isEnd: results.length < pageSize,
    data: results,
  };
}

export async function search(query, page, type) {
  if (type === "music") {
    return await searchMusic(query, page);
  }

  return {
    isEnd: true,
    data: [],
  };
}

export async function getMediaSource(musicItem, quality) {
  try {
    let br = "320"; // 默认320k音质

    // 根据质量参数选择音质
    switch (quality) {
      case "low":
        br = "128";
        break;
      case "standard":
        br = "192";
        break;
      case "high":
        br = "320";
        break;
      case "super":
        br = "740";
        break;
      case "lossless":
        br = "999";
        break;
      default:
        br = "320";
    }

    const response = await axios.get(baseURL, {
      params: {
        types: "url",
        source: musicItem.source || "netease",
        id: musicItem.id,
        br: br,
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 10000, // 10秒超时
    });

    const data = response.data;

    if (data && data.url) {
      return {
        url: data.url,
        quality: data.br || br,
        size: data.size,
      };
    }

    // 如果获取失败，尝试降低音质重试
    if (br !== "128") {
      console.log(`音质 ${br} 获取失败，尝试降低音质重试`);
      const fallbackBr = br === "999" ? "740" : br === "740" ? "320" : "128";

      const fallbackResponse = await axios.get(baseURL, {
        params: {
          types: "url",
          source: musicItem.source || "netease",
          id: musicItem.id,
          br: fallbackBr,
        },
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 10000,
      });

      const fallbackData = fallbackResponse.data;
      if (fallbackData && fallbackData.url) {
        return {
          url: fallbackData.url,
          quality: fallbackData.br || fallbackBr,
          size: fallbackData.size,
        };
      }
    }

    return {};
  } catch (error) {
    console.error("获取音频链接失败:", error.message);
    return {};
  }
}

export async function getLyric(musicItem) {
  try {
    const response = await axios.get(baseURL, {
      params: {
        types: "lyric",
        source: musicItem.source || "netease",
        id: musicItem.lyricId || musicItem.id,
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 10000, // 10秒超时
    });

    const data = response.data;

    return {
      rawLrc: data.lyric || "",
      translation: data.tlyric || "",
    };
  } catch (error) {
    console.error("获取歌词失败:", error.message);
    return {
      rawLrc: "",
    };
  }
}

module.exports = {
  platform: "GDStudio音乐",
  author: "猫头猫",
  version: "0.1.0",
  supportedSearchType: ["music"],
  primaryKey: ["id", "source"], // 添加主键标识
  supportedQuality: ["low", "standard", "high", "super", "lossless"], // 支持的音质
  srcUrl:
    "https://gitee.com/maotoumao/MusicFreePlugins/raw/v0.1/dist/gdstudio/index.js",
  cacheControl: "no-cache",
  search,
  getMediaSource,
  getLyric,
};
