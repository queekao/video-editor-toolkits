const fs = require("fs/promises");
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
module.exports = util;
