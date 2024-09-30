const fs = require("fs/promises");
const redis = require("redis");
let redisClient;
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
async function getRedisClient() {
  try {
    if (!redisClient) {
      redisClient = redis.createClient({
        socket: {
          host: process.env.IS_DOCKER ? "redis" : "localhost",
          port: 6379,
          enableOfflineQueue: false,
        },
      });
      await redisClient.connect();
    }
    return redisClient;
  } catch (error) {
    console.log(error);
  }
}
/**
 * @param {string} cacheKey - The key you wanna cache for the videoData
 * @param {any} videoData - If the cache miss we wanna store the data
 * @returns {any} - the video data
 */
util.getOrSetCache = async (cacheKey, videoData) => {
  const client = await getRedisClient();
  // await client.connect();
  const cacheData = await client.get(cacheKey);
  if (!cacheData) {
    // Strings: Basic key-value pairs.
    await client.setEx(
      cacheKey,
      3600, // default cache time(sec)
      JSON.stringify(videoData)
    );
    console.log("Cache Miss");
    return videoData;
  } else {
    console.log("Cache Hit");
    return JSON.parse(cacheData);
  }
  await client.disconnect();
};
/**
 * @param {string} cacheKey - The key you wanna clear cache
 */
util.invalidateCache = async (cacheKey) => {
  const client = await getRedisClient();
  client.del(cacheKey, async (err, response) => {
    if (response == 1) {
      console.log("Cache invalidated");
    } else {
      console.log("Key does not exist");
    }
  });
};

module.exports = util;
