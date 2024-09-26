const path = require("path");
const cluster = require("cluster");
const crypto = require("crypto");
const fs = require("fs/promises");
const fsSync = require("fs");
const { pipeline } = require("stream/promises");
const util = require("../../lib/util");
const FF = require("../../lib/FF");
const DB = require("../DB");
const JobQueue = require("../../lib/JobQueue");

let jobQueue;
if (cluster.isPrimary) {
  // Handle not cluster mode
  jobQueue = new JobQueue();
}
const getVideos = async (req, res, handleErr) => {
  DB.update();
  const videos = DB.videos.filter((video) => video.userId === req.userId);
  const cacheVideosData = await util.getOrSetCache(
    req.userId.toString(),
    videos
  );
  if (cacheVideosData) {
    res.status(200).json(cacheVideosData);
    return;
  }
  res.status(200).json(videos);
};
const uploadVideo = async (req, res, handleErr) => {
  const storagePath = "./storage";
  if (!fsSync.existsSync(storagePath)) {
    fs.mkdir(storagePath, (err) => {
      if (err) {
        console.error("Error creating directory:", err);
      } else {
        console.log("Directory created successfully");
      }
    });
  }
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
    const dimensions = await FF.getDimensions(fullPath);
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
    util.invalidateCache(req.userId.toString());
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
const extractAudio = async (req, res, handleErr) => {
  const videoId = req.params.get("videoId");
  DB.update();
  const video = DB.videos.find((video) => video.videoId === videoId);
  if (video.extractedAudio) {
    return handleErr({
      status: 400,
      message: "The audio has already been extracted for this video.",
    });
  }
  const originalVideoPath = `./storage/${videoId}/original.${video.extension}`;
  // AAC generally achieves better sound quality than MP3 at similar bit rates
  const targetAudioPath = `./storage/${videoId}/audio.aac`;
  try {
    await FF.extractAudio(originalVideoPath, targetAudioPath);
    video.extractedAudio = true;
    DB.save();
    util.invalidateCache(req.userId.toString());
    res.status(200).json({
      status: "success",
      message: "The audio was extracted successfully",
    });
  } catch (error) {
    util.deleteFile(targetAudioPath);
    return handleErr(error);
  }
};
const resizeVideo = async (req, res, handleErr) => {
  // NOTE: Resize can spend much time if you resize to high resolution video
  const { height, width, videoId } = req.body;
  DB.update();
  const video = DB.videos.find((video) => video.videoId === videoId);
  if (!video) {
    return handleErr({
      status: 404,
      message: "Video not found!",
    });
  }
  video.resizes[`${width}x${height}`] = { processing: true }; // Processing video resizing
  DB.save();
  // `child process` send message to `parent process` to perform resizing
  if (video.userId) util.invalidateCache(video.userId.toString());
  if (!jobQueue)
    process.send({ messageType: "new-resize", data: { video, width, height } });
  else
    jobQueue.enqueue({
      type: "resize",
      video,
      width,
      height,
    });
  res.status(200).json({
    status: "success",
    message: "The video is now being processed",
  });
};

const getVideoAsset = async (req, res, handleErr) => {
  const videoId = req.params.get("videoId");
  const type = req.params.get("type");
  DB.update();
  const video = DB.videos.find((video) => video.videoId === videoId);
  if (!video) {
    return handleErr({
      status: 404,
      message: "Video not found!",
    });
  }
  let file;
  let mineType;
  let filename; // the downloaded filename
  switch (type) {
    case "thumbnail":
      file = await fs.open(`./storage/${videoId}/thumbnail.jpg`, "r");
      mineType = "image/jpeg";
      break;
    case "audio":
      file = await fs.open(`./storage/${videoId}/audio.aac`, "r");
      mineType = "audio/aac";
      filename = `${video.name}-audio.aac`;
      break;
    case "resize":
      const dimensions = req.params.get("dimensions");
      file = await fs.open(
        `./storage/${videoId}/${dimensions}.${video.extension}`,
        "r"
      );
      mineType = `video/${video.extension}`;
      filename = `${video.name}-${dimensions}.${video.extension}`;
      break;
    case "original":
      file = await fs.open(
        `./storage/${videoId}/original.${video.extension}`,
        "r"
      );
      mineType = `video/${video.extension}`;
      filename = `${video.name}.${video.extension}`;
    default:
      break;
  }
  try {
    // Grab the file size
    const stat = await file.stat();
    const fileStream = file.createReadStream();
    if (type !== "thumbnail") {
      // Download file
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    }
    // Set the Content-Type header based on the file type
    res.setHeader("Content-Type", mineType);
    res.setHeader("Content-Length", stat.size);
    res.status(200);
    await pipeline(fileStream, res); // serve the asset with stream
    file.close();
  } catch (error) {
    console.error(error);
  }
};
const controller = {
  getVideos,
  uploadVideo,
  getVideoAsset,
  extractAudio,
  resizeVideo,
};

module.exports = controller;
