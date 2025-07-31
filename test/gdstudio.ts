import { search, getMediaSource, getLyric } from "../plugins/gdstudio/index";

async function testGDStudio() {
  console.log("=== 测试GDStudio插件 ===");

  try {
    // 测试搜索功能
    console.log("\n1. 测试搜索功能...");
    const searchResult = await search("周杰伦", 1, "music");
    console.log("搜索结果:", JSON.stringify(searchResult, null, 2));

    if (searchResult.data && searchResult.data.length > 0) {
      const firstSong = searchResult.data[0];
      console.log("\n2. 测试获取音频链接...");

      // 测试获取音频链接
      const mediaSource = await getMediaSource(firstSong, "high");
      console.log("音频链接:", JSON.stringify(mediaSource, null, 2));

      // 测试获取歌词
      console.log("\n3. 测试获取歌词...");
      const lyric = await getLyric(firstSong);
      console.log("歌词:", JSON.stringify(lyric, null, 2));
    }
  } catch (error) {
    console.error("测试失败:", error);
  }
}

testGDStudio();
