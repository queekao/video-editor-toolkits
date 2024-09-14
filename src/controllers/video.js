const path = require("path");
const crypto = require("crypto");
const fs = require("fs/promises");
const { pipeline } = require("stream/promises");
const util = require("../../lib/util");
const FF = require("../../lib/FF");
const DB = require("../DB");
const getVideos = (req, res, handleErr) => {
  const name = req.params.get("name");
  if (name) {
    res.json({ message: `Your name is ${name}` });
  } else {
    return handleErr({ status: 400, message: "Please specify a name." });
  }
};
const uploadVideo = async (req, res, handleErr) => {
  const specifiedFileName = req.headers.filename;
  const extension = path.extname(specifiedFileName).substring(1).toLowerCase();
  const name = path.parse(specifiedFileName).name;
  const videoId = crypto.randomBytes(4).toString("hex");
  try {
    await fs.mkdir(`./storage/${videoId}`);
    const fullPath = `./storage/${videoId}/original.${extension}`; // store the video file
    const file = await fs.open(fullPath, "w");
    const fileStream = file.createWriteStream();
    const thumbnailPath = `./storage/${videoId}/thumbnail.jpg`;
    await pipeline(req, fileStream);
    // Make a thumbnail and the video file.
    await FF.makeThumbnail(fullPath, thumbnailPath);
    // Get the dimesions.
    const dimesion = await FF.getDimesions(fullPath);
    // After we finish uploading we save data to database.
    DB.update();
    DB.videos.unshift({
      id: DB.videos.length,
      videoId,
      name,
      extension,
      userId: req.userId,
      extractedAudio: false,
      dimesion,
      thumbnail: thumbnailPath,
      resizes: {},
    });
    DB.save();
    res.status(200).json({
      status: "success",
      message: "The file was uploaded successfully!",
    });
  } catch (error) {
    // If the uploading process being canceled
    const err = await util.deleteFolder(`./storage/${videoId}`);
    if (err) return handleErr(err);
    if (error.code !== "ECONNRESET") return handleErr(error);
  }
};
const controller = {
  getVideos,
  uploadVideo,
};

module.exports = controller;
