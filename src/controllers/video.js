const path = require("path");
const crypto = require("crypto");
const fs = require("fs/promises");
const { pipeline } = require("stream/promises");
const util = require("../../lib/util");
const FF = require("../../lib/FF");
const DB = require("../DB");
const getVideos = (req, res, handleErr) => {
  DB.update();
  const videos = DB.videos.filter((video) => video.userId === req.userId);
  res.status(200).json(videos);
};
const uploadVideo = async (req, res, handleErr) => {
  const specifiedFileName = req.headers.filename;
  const extension = path.extname(specifiedFileName).substring(1).toLowerCase();
  const name = path.parse(specifiedFileName).name;
  const videoId = crypto.randomBytes(4).toString("hex");
  const FORMATS_SUPPORTED_TYPE = ["mov", "mp4"];
  if (FORMATS_SUPPORTED_TYPE.indexOf(extension) == -1) {
    return handleErr({
      status: 400,
      message: "Only these formats are allowed: mov, mp4",
    });
  }
  try {
    await fs.mkdir(`./storage/${videoId}`);
    const fullPath = `./storage/${videoId}/original.${extension}`; // store the video file
    const file = await fs.open(fullPath, "w");
    const fileStream = file.createWriteStream();
    const thumbnailPath = `./storage/${videoId}/thumbnail.jpg`;
    await pipeline(req, fileStream);
    // Make a thumbnail and the video file.
    await FF.makeThumbnail(fullPath, thumbnailPath);
    // Get the dimensions.
    const dimensions = await FF.getDimesions(fullPath);
    // After we finish uploading we save data to database.
    DB.update();
    DB.videos.unshift({
      id: DB.videos.length,
      videoId,
      name,
      extension,
      userId: req.userId,
      extractedAudio: false,
      dimensions,
      thumbnail: thumbnailPath,
      resizes: {},
    });
    DB.save();
    res.status(201).json({
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
