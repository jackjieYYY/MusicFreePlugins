"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLyric = exports.getMediaSource = exports.search = void 0;
const axios_1 = require("axios");
const pageSize = 20;
const baseURL = "https://music-api.gdstudio.xyz/api.php";
var BitrateEnum;
(function (BitrateEnum) {
    BitrateEnum["LOW"] = "192";
    BitrateEnum["STANDARD"] = "320";
    BitrateEnum["HIGH"] = "740";
    BitrateEnum["SUPER"] = "999";
})(BitrateEnum || (BitrateEnum = {}));
const MusicSourceEnum = {
    NETEASE: { value: "netease", label: "网易云" },
    TENCENT: { value: "tencent", label: "腾讯" },
    TIDAL: { value: "tidal", label: "Tidal" },
    SPOTIFY: { value: "spotify", label: "Spotify" },
    YTMUSIC: { value: "ytmusic", label: "YouTube" },
    QOBUZ: { value: "qobuz", label: "Qobuz" },
    JOOX: { value: "joox", label: "JOOX" },
    DEEZER: { value: "deezer", label: "Deezer" },
    MIGU: { value: "migu", label: "咪咕" },
    KUGOU: { value: "kugou", label: "酷狗" },
    KUWO: { value: "kuwo", label: "酷我" },
    XIMALAYA: { value: "ximalaya", label: "喜马拉雅" },
    APPLE: { value: "apple", label: "Apple" },
};
const currentSource = MusicSourceEnum.XIMALAYA;
const mediaType = "music";
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
        const response = await axios_1.default.get(baseURL, {
            params: {
                types: "search",
                source: source,
                name: query,
                count: pageSize,
                pages: page,
            },
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            timeout: 10000,
        });
        const data = response.data;
        if (!Array.isArray(data)) {
            return [];
        }
        return data.map(formatMusicItem);
    }
    catch (error) {
        console.error(`搜索失败 (${source}):`, error.message);
        return [];
    }
}
async function searchMusic(query, page) {
    let results = await searchMusicWithSource(query, page, currentSource.value);
    return {
        isEnd: results.length < pageSize,
        data: results,
    };
}
async function search(query, page, type) {
    if (type === mediaType) {
        return await searchMusic(query, page);
    }
    return {
        isEnd: true,
        data: [],
    };
}
exports.search = search;
async function getMediaSource(musicItem, quality) {
    try {
        let br = BitrateEnum.HIGH;
        switch (quality) {
            case "low":
                br = BitrateEnum.LOW;
                break;
            case "standard":
                br = BitrateEnum.STANDARD;
                break;
            case "high":
                br = BitrateEnum.HIGH;
                break;
            case "super":
                br = BitrateEnum.SUPER;
                break;
            default:
                br = BitrateEnum.HIGH;
        }
        const response = await axios_1.default.get(baseURL, {
            params: {
                types: "url",
                source: musicItem.source,
                id: musicItem.id,
                br: br,
            },
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            timeout: 10000,
        });
        const data = response.data;
        if (data && data.url) {
            return {
                url: data.url,
                quality: data.br || br,
                size: data.size,
            };
        }
        if (br !== BitrateEnum.LOW) {
            console.log(`音质 ${br} 获取失败，尝试降低音质重试`);
            const fallbackBr = br === BitrateEnum.SUPER
                ? BitrateEnum.HIGH
                : br === BitrateEnum.HIGH
                    ? BitrateEnum.STANDARD
                    : BitrateEnum.LOW;
            const fallbackResponse = await axios_1.default.get(baseURL, {
                params: {
                    types: "url",
                    source: musicItem.source || "netease",
                    id: musicItem.id,
                    br: fallbackBr,
                },
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
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
    }
    catch (error) {
        console.error("获取音频链接失败:", error.message);
        return {};
    }
}
exports.getMediaSource = getMediaSource;
async function getLyric(musicItem) {
    try {
        const response = await axios_1.default.get(baseURL, {
            params: {
                types: "lyric",
                source: musicItem.source,
                id: musicItem.lyricId || musicItem.id,
            },
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            timeout: 10000,
        });
        const data = response.data;
        return {
            rawLrc: data.lyric || "",
            translation: data.tlyric || "",
        };
    }
    catch (error) {
        console.error("获取歌词失败:", error.message);
        return {
            rawLrc: "",
        };
    }
}
exports.getLyric = getLyric;
module.exports = {
    platform: currentSource.label,
    author: "欧皇大佬",
    version: "0.1.0",
    supportedSearchType: ["music"],
    primaryKey: ["id", "source"],
    supportedQuality: ["low", "standard", "high", "super"],
    srcUrl: `https://raw.githubusercontent.com/jackjieYYY/MusicFreePlugins/refs/heads/master/dist/${currentSource.value}/index.js`,
    cacheControl: "no-cache",
    search,
    getMediaSource,
    getLyric,
};
