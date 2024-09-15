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
util.extractTokenValue = (text) => {
  const pattern = /token=([^\s]+)/;
  const matches = text.match(pattern);
  if (matches && matches[1]) {
    return matches[1];
  } else {
    return null;
  }
};

module.exports = util;
