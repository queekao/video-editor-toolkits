const fs = require("fs/promises");
const redis = require("redis");
const client = redis.createClient({
  host: "127.0.0.1",
  port: 6379,
  enableOfflineQueue: false,
});
const util = {};
util.deleteFile = async (path) => {
  try {
    await fs.unlink(path); // remove one file
  } catch (error) {
    // do nothing
    return error;
  }
};
util.deleteFolder = async (path) => {
  try {
    await fs.rm(path, { recursive: true });
  } catch (error) {
    // do nothing
    return error;
  }
};
util.extractTokenValue = (text) => {
  const pattern = /token=([^\s]+)/;
  const matches = text.match(pattern);
  if (matches && matches[1]) {
    return matches[1];
  } else {
    return null;
  }
};
/**
 *
 * @param {string} cacheKey - The key you wanna cache for the videoData
 * @param {any} videoData - If the cache miss we wanna store the data
 * @returns {any} - the video data
 */
util.getOrSetCache = async (cacheKey, videoData) => {
  await client.connect();
  const cacheData = await client.get(cacheKey);
  if (!cacheData) {
    // Strings: Basic key-value pairs.
    await client.setEx(
      cacheKey,
      3600, // default cache time(sec)
      JSON.stringify(videoData)
    );
    console.log("Cache Miss");
    await client.disconnect();
    return videoData;
  } else {
    console.log("Cache Hit");
    await client.disconnect();
    return JSON.parse(cacheData);
  }
};

module.exports = util;
